from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.domains.dependencies import get_session
from backend.domains.users.service import UserService
from backend.infrastructure.db.repositories.users import UserRepository


def get_user_service(session: Annotated[AsyncSession, Depends(get_session)]) -> UserService:
    return UserService(session, UserRepository(session))
