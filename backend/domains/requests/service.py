from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from backend.domains.errors import ConflictError, ForbiddenError, NotFoundError
from backend.domains.requests.schemas import (
    AssignmentCreate,
    RepairRequestCreate,
    RequestStatusUpdate,
)
from backend.infrastructure.db.models import (
    Assignment,
    RepairRequest,
    RequestStatus,
    RequestStatusHistory,
    User,
    UserRole,
)
from backend.infrastructure.db.repositories.assignments import AssignmentRepository
from backend.infrastructure.db.repositories.fault_types import FaultTypeRepository
from backend.infrastructure.db.repositories.request_status_history import (
    RequestStatusHistoryRepository,
)
from backend.infrastructure.db.repositories.requests import RepairRequestRepository
from backend.infrastructure.db.repositories.rooms import RoomRepository
from backend.infrastructure.db.repositories.users import UserRepository

MASTER_TRANSITIONS: dict[RequestStatus, frozenset[RequestStatus]] = {
    RequestStatus.IN_PROGRESS: frozenset({RequestStatus.DONE}),
    RequestStatus.DONE: frozenset({RequestStatus.IN_PROGRESS}),
}


class RepairRequestService:
    def __init__(
        self,
        session: AsyncSession,
        requests: RepairRequestRepository,
        assignments: AssignmentRepository,
        status_history: RequestStatusHistoryRepository,
        users: UserRepository,
        rooms: RoomRepository,
        fault_types: FaultTypeRepository,
    ) -> None:
        self._session = session
        self._requests = requests
        self._assignments = assignments
        self._status_history = status_history
        self._users = users
        self._rooms = rooms
        self._fault_types = fault_types

    async def create(self, resident: User, data: RepairRequestCreate) -> RepairRequest:
        if await self._rooms.get_by_id(data.room_id) is None:
            raise NotFoundError("Комната не найдена")
        fault_type = await self._fault_types.get_by_id(data.fault_type_id)
        if fault_type is None or not fault_type.is_active:
            raise NotFoundError("Тип неисправности не найден")

        request = RepairRequest(resident_id=resident.id, **data.model_dump())
        self._requests.add(request)
        self._status_history.add(
            RequestStatusHistory(
                request=request,
                changed_by_id=resident.id,
                old_status=None,
                new_status=RequestStatus.NEW,
            )
        )
        return await self.save(request)

    async def get(self, request_id: int, user: User) -> RepairRequest:
        request = await self._requests.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Заявка не найдена")
        if not self.can_view(request, user):
            raise ForbiddenError("Нет доступа к заявке")
        return request

    async def list_visible_to(
        self, user: User, status: RequestStatus | None = None
    ) -> list[RepairRequest]:
        match user.role:
            case UserRole.RESIDENT:
                return await self._requests.list_by(resident_id=user.id, status=status)
            case UserRole.MASTER:
                return await self._requests.list_by(master_id=user.id, status=status)
            case _:
                return await self._requests.list_by(status=status)

    async def get_history(self, request_id: int, user: User) -> list[RequestStatusHistory]:
        await self.get(request_id, user)
        return await self._status_history.list_by_request(request_id)

    async def assign(
        self, request_id: int, dispatcher: User, data: AssignmentCreate
    ) -> RepairRequest:
        request = await self.get(request_id, dispatcher)
        if request.status == RequestStatus.DONE:
            raise ConflictError("Заявка уже закрыта")
        master = await self._users.get_by_id(data.master_id)
        if master is None or not master.is_active or master.role != UserRole.MASTER:
            raise NotFoundError("Мастер не найден")

        await self._assignments.deactivate_for_request(request.id)
        self._assignments.add(
            Assignment(request_id=request.id, dispatcher_id=dispatcher.id, **data.model_dump())
        )
        if request.status == RequestStatus.NEW:
            self.transition(request, RequestStatus.IN_PROGRESS, dispatcher)
        return await self.save(request)

    async def change_status(
        self, request_id: int, master: User, data: RequestStatusUpdate
    ) -> RepairRequest:
        request = await self.get(request_id, master)
        if data.status not in MASTER_TRANSITIONS.get(request.status, ()):
            raise ConflictError(
                f"Переход из статуса '{request.status}' в '{data.status}' недопустим"
            )
        self.transition(request, data.status, master)
        request.closed_at = datetime.now(UTC) if data.status == RequestStatus.DONE else None
        return await self.save(request)

    def transition(self, request: RepairRequest, new_status: RequestStatus, actor: User) -> None:
        self._status_history.add(
            RequestStatusHistory(
                request=request,
                changed_by_id=actor.id,
                old_status=request.status,
                new_status=new_status,
            )
        )
        request.status = new_status

    async def save(self, request: RepairRequest) -> RepairRequest:
        await self._session.commit()
        await self._session.refresh(request)
        return request

    @staticmethod
    def can_view(request: RepairRequest, user: User) -> bool:
        match user.role:
            case UserRole.RESIDENT:
                return request.resident_id == user.id
            case UserRole.MASTER:
                assignment = request.active_assignment
                return assignment is not None and assignment.master_id == user.id
            case _:
                return True
