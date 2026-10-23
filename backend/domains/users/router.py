from typing import Annotated

from fastapi import APIRouter, Depends, status

from backend.domains.auth.dependencies import Admin, DispatcherOrAdmin
from backend.domains.auth.schemas import UserResponse
from backend.domains.users.dependencies import get_user_service
from backend.domains.users.schemas import UserCreate, UserUpdate
from backend.domains.users.service import UserService
from backend.infrastructure.db.models import UserRole

router = APIRouter(prefix="/users", tags=["users"])

Service = Annotated[UserService, Depends(get_user_service)]


@router.get("")
async def list_users(
    service: Service,
    _: DispatcherOrAdmin,
    role: UserRole | None = None,
    is_active: bool | None = None,
) -> list[UserResponse]:
    return await service.list_by(role, is_active)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(service: Service, _: Admin, body: UserCreate) -> UserResponse:
    return await service.create(body)


@router.get("/{user_id}")
async def get_user(service: Service, _: Admin, user_id: int) -> UserResponse:
    return await service.get(user_id)


@router.patch("/{user_id}")
async def update_user(
    service: Service, admin: Admin, user_id: int, body: UserUpdate
) -> UserResponse:
    return await service.update(user_id, admin, body)
