from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.infrastructure.db.models import Assignment


class AssignmentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def add(self, assignment: Assignment) -> None:
        self._session.add(assignment)

    async def deactivate_for_request(self, request_id: int) -> None:
        stmt = (
            update(Assignment)
            .where(Assignment.request_id == request_id, Assignment.is_active)
            .values(is_active=False)
        )
        await self._session.execute(stmt)
