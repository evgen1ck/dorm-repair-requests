from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.domains.dependencies import get_session
from backend.domains.rooms.service import RoomService
from backend.infrastructure.db.repositories.rooms import RoomRepository


def get_room_service(session: Annotated[AsyncSession, Depends(get_session)]) -> RoomService:
    return RoomService(RoomRepository(session))
