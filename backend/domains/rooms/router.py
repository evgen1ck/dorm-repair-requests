from typing import Annotated

from fastapi import APIRouter, Depends

from backend.domains.rooms.dependencies import get_room_service
from backend.domains.rooms.schemas import RoomResponse
from backend.domains.rooms.service import RoomService

router = APIRouter(prefix="/rooms", tags=["rooms"])

Service = Annotated[RoomService, Depends(get_room_service)]


@router.get("")
async def list_rooms(service: Service) -> list[RoomResponse]:
    return await service.list_all()
