from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.infrastructure.db.models import FaultType


class FaultTypeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, fault_type_id: int) -> FaultType | None:
        return await self._session.get(FaultType, fault_type_id)

    async def list_active(self) -> list[FaultType]:
        stmt = select(FaultType).where(FaultType.is_active).order_by(FaultType.id)
        return list((await self._session.scalars(stmt)).all())
