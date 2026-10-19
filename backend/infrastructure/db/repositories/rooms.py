from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.infrastructure.db.models import Room


class RoomRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, room_id: int) -> Room | None:
        return await self._session.get(Room, room_id)

    async def list_all(self) -> list[Room]:
        stmt = select(Room).order_by(Room.building, Room.number)
        return list((await self._session.scalars(stmt)).all())
