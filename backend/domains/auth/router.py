from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from backend.core.settings import Settings
from backend.domains.auth.dependencies import ACCESS_TOKEN_COOKIE, CurrentUser, get_auth_service
from backend.domains.auth.schemas import LoginRequest, UserResponse
from backend.domains.auth.service import AuthService
from backend.domains.dependencies import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])

Service = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/login")
async def login(
    service: Service,
    settings: Annotated[Settings, Depends(get_settings)],
    body: LoginRequest,
    response: Response,
) -> UserResponse:
    user, token = await service.login(body.login, body.password)
    response.set_cookie(
        ACCESS_TOKEN_COOKIE,
        token,
        max_age=int(settings.access_token_ttl.total_seconds()),
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
    )
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    response.delete_cookie(ACCESS_TOKEN_COOKIE)


@router.get("/me")
async def me(user: CurrentUser) -> UserResponse:
    return user
