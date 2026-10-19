from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.infrastructure.db.models import RepairRequest


class RepairRequestRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def add(self, request: RepairRequest) -> None:
        self._session.add(request)

    async def get_by_id(self, request_id: int) -> RepairRequest | None:
        return await self._session.get(RepairRequest, request_id)

    async def list_by_resident(self, resident_id: int) -> list[RepairRequest]:
        stmt = (
            select(RepairRequest)
            .where(RepairRequest.resident_id == resident_id)
            .order_by(RepairRequest.created_at.desc(), RepairRequest.id.desc())
        )
        return list((await self._session.scalars(stmt)).all())
