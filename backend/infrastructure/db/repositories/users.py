from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.infrastructure.db.models import User, UserRole


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def add(self, user: User) -> None:
        self._session.add(user)

    async def get_by_id(self, user_id: int) -> User | None:
        return await self._session.get(User, user_id)

    async def get_by_login(self, login: str) -> User | None:
        return await self._session.scalar(select(User).where(User.login == login))

    async def list_by(
        self, *, role: UserRole | None = None, is_active: bool | None = None
    ) -> list[User]:
        stmt = select(User).order_by(User.full_name, User.id)
        if role is not None:
            stmt = stmt.where(User.role == role)
        if is_active is not None:
            stmt = stmt.where(User.is_active == is_active)
        return list((await self._session.scalars(stmt)).all())
