from sqlalchemy.ext.asyncio import AsyncSession

from backend.domains.errors import ForbiddenError, NotFoundError
from backend.domains.requests.schemas import RepairRequestCreate
from backend.infrastructure.db.models import RepairRequest
from backend.infrastructure.db.repositories.fault_types import FaultTypeRepository
from backend.infrastructure.db.repositories.requests import RepairRequestRepository
from backend.infrastructure.db.repositories.rooms import RoomRepository
from backend.infrastructure.db.repositories.users import UserRepository


class RepairRequestService:
    def __init__(
        self,
        session: AsyncSession,
        requests: RepairRequestRepository,
        users: UserRepository,
        rooms: RoomRepository,
        fault_types: FaultTypeRepository,
    ) -> None:
        self._session = session
        self._requests = requests
        self._users = users
        self._rooms = rooms
        self._fault_types = fault_types

    async def create(self, data: RepairRequestCreate) -> RepairRequest:
        resident = await self._users.get_by_id(data.resident_id)
        if resident is None:
            raise NotFoundError("Жилец не найден")
        if not resident.is_active_resident:
            raise ForbiddenError("Подавать заявки могут только активные жильцы")
        if await self._rooms.get_by_id(data.room_id) is None:
            raise NotFoundError("Комната не найдена")
        fault_type = await self._fault_types.get_by_id(data.fault_type_id)
        if fault_type is None or not fault_type.is_active:
            raise NotFoundError("Тип неисправности не найден")

        request = RepairRequest(**data.model_dump())
        self._requests.add(request)
        await self._session.commit()
        await self._session.refresh(request)
        return request

    async def get(self, request_id: int) -> RepairRequest:
        request = await self._requests.get_by_id(request_id)
        if request is None:
            raise NotFoundError("Заявка не найдена")
        return request

    async def list_by_resident(self, resident_id: int) -> list[RepairRequest]:
        return await self._requests.list_by_resident(resident_id)
