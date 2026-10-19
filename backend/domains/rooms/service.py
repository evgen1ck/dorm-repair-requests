from backend.infrastructure.db.models import Room
from backend.infrastructure.db.repositories.rooms import RoomRepository


class RoomService:
    def __init__(self, rooms: RoomRepository) -> None:
        self._rooms = rooms

    async def list_all(self) -> list[Room]:
        return await self._rooms.list_all()
