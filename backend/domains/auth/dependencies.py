from collections.abc import Awaitable, Callable
from typing import Annotated

from fastapi import Depends
from fastapi.security import APIKeyCookie
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.settings import Settings
from backend.domains.auth.service import AuthService
from backend.domains.dependencies import get_session, get_settings
from backend.domains.errors import ForbiddenError
from backend.infrastructure.db.models import User, UserRole
from backend.infrastructure.db.repositories.users import UserRepository

ACCESS_TOKEN_COOKIE = "access_token"

access_token_cookie = APIKeyCookie(name=ACCESS_TOKEN_COOKIE, auto_error=False)


def get_auth_service(
    session: Annotated[AsyncSession, Depends(get_session)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> AuthService:
    return AuthService(UserRepository(session), settings.secret_key, settings.access_token_ttl)


async def get_current_user(
    service: Annotated[AuthService, Depends(get_auth_service)],
    token: Annotated[str | None, Depends(access_token_cookie)],
) -> User:
    return await service.authenticate(token)


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*roles: UserRole) -> Callable[[User], Awaitable[User]]:
    async def check_role(user: CurrentUser) -> User:
        if user.role not in roles:
            raise ForbiddenError("Недостаточно прав")
        return user

    return check_role


Admin = Annotated[User, Depends(require_roles(UserRole.ADMIN))]
Resident = Annotated[User, Depends(require_roles(UserRole.RESIDENT))]
DispatcherOrAdmin = Annotated[User, Depends(require_roles(UserRole.DISPATCHER, UserRole.ADMIN))]
Master = Annotated[User, Depends(require_roles(UserRole.MASTER))]
