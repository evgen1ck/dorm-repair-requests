from pydantic import MISSING
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.security import hash_password
from backend.domains.errors import ConflictError, NotFoundError
from backend.domains.users.schemas import UserCreate, UserUpdate
from backend.infrastructure.db.models import User, UserRole
from backend.infrastructure.db.repositories.users import UserRepository


class UserService:
    def __init__(self, session: AsyncSession, users: UserRepository) -> None:
        self._session = session
        self._users = users

    async def list_by(self, role: UserRole | None, is_active: bool | None) -> list[User]:
        return await self._users.list_by(role=role, is_active=is_active)

    async def get(self, user_id: int) -> User:
        user = await self._users.get_by_id(user_id)
        if user is None:
            raise NotFoundError("Пользователь не найден")
        return user

    async def create(self, data: UserCreate) -> User:
        if await self._users.get_by_login(data.login) is not None:
            raise ConflictError("Логин уже занят")
        user = User(
            password_hash=hash_password(data.password),
            **data.model_dump(exclude={"password"}),
        )
        self._users.add(user)
        return await self.save(user)

    async def update(self, user_id: int, actor: User, data: UserUpdate) -> User:
        user = await self.get(user_id)
        loses_own_access = data.is_active is False or data.role not in (MISSING, UserRole.ADMIN)
        if user.id == actor.id and loses_own_access:
            raise ConflictError("Нельзя деактивировать себя или сменить свою роль")
        changes = data.model_dump()
        if "password" in changes:
            user.password_hash = hash_password(changes.pop("password"))
        for field, value in changes.items():
            setattr(user, field, value)
        return await self.save(user)

    async def save(self, user: User) -> User:
        await self._session.commit()
        await self._session.refresh(user)
        return user
