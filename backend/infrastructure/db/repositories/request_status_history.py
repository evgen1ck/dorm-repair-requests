from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.infrastructure.db.models import RequestStatusHistory


class RequestStatusHistoryRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def add(self, entry: RequestStatusHistory) -> None:
        self._session.add(entry)

    async def list_by_request(self, request_id: int) -> list[RequestStatusHistory]:
        stmt = (
            select(RequestStatusHistory)
            .where(RequestStatusHistory.request_id == request_id)
            .order_by(RequestStatusHistory.changed_at, RequestStatusHistory.id)
        )
        return list((await self._session.scalars(stmt)).all())
