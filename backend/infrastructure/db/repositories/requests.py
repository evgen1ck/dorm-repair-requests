from datetime import datetime

from sqlalchemy import Row, and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, contains_eager

from backend.infrastructure.db.models import Assignment, FaultType, RepairRequest, RequestStatus


class RepairRequestRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def add(self, request: RepairRequest) -> None:
        self._session.add(request)

    async def get_by_id(self, request_id: int) -> RepairRequest | None:
        return await self._session.get(RepairRequest, request_id)

    async def list_by(
        self,
        *,
        resident_id: int | None = None,
        master_id: int | None = None,
        status: RequestStatus | None = None,
    ) -> list[RepairRequest]:
        stmt = select(RepairRequest).order_by(
            RepairRequest.created_at.desc(), RepairRequest.id.desc()
        )
        if resident_id is not None:
            stmt = stmt.where(RepairRequest.resident_id == resident_id)
        if master_id is not None:
            stmt = (
                stmt.join(RepairRequest.active_assignment)
                .where(Assignment.master_id == master_id)
                .options(contains_eager(RepairRequest.active_assignment))
            )
        if status is not None:
            stmt = stmt.where(RepairRequest.status == status)
        return list((await self._session.scalars(stmt)).all())

    async def count_by_fault_type(self, period_start: datetime, period_end: datetime) -> list[Row]:
        fault_type = aliased(FaultType, name="fault_type")
        created_in_period = and_(
            RepairRequest.fault_type_id == fault_type.id,
            RepairRequest.created_at >= period_start,
            RepairRequest.created_at < period_end,
        )
        total = func.count(RepairRequest.id)
        stmt = (
            select(
                fault_type,
                total.label("total"),
                total.filter(RepairRequest.status == RequestStatus.NEW).label("new"),
                total.filter(RepairRequest.status == RequestStatus.IN_PROGRESS).label(
                    "in_progress"
                ),
                total.filter(RepairRequest.status == RequestStatus.DONE).label("done"),
            )
            .outerjoin(RepairRequest, created_in_period)
            .group_by(fault_type.id)
            .order_by(fault_type.id)
        )
        return list((await self._session.execute(stmt)).all())
