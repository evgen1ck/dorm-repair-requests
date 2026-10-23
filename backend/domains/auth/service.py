from datetime import timedelta

from backend.core.security import (
    create_access_token,
    read_access_token_subject,
    unmatchable_password_hash,
    verify_password,
)
from backend.domains.errors import UnauthorizedError
from backend.infrastructure.db.models import User
from backend.infrastructure.db.repositories.users import UserRepository


class AuthService:
    def __init__(self, users: UserRepository, secret_key: str, token_ttl: timedelta) -> None:
        self._users = users
        self._secret_key = secret_key
        self._token_ttl = token_ttl

    async def login(self, login: str, password: str) -> tuple[User, str]:
        user = await self._users.get_by_login(login)
        password_hash = user.password_hash if user is not None else unmatchable_password_hash()
        password_matches = verify_password(password, password_hash)
        if user is None or not user.is_active or not password_matches:
            raise UnauthorizedError("Неверный логин или пароль")
        return user, create_access_token(str(user.id), self._secret_key, self._token_ttl)

    async def authenticate(self, token: str | None) -> User:
        subject = read_access_token_subject(token, self._secret_key) if token else None
        if subject is None:
            raise UnauthorizedError("Требуется вход")
        user = await self._users.get_by_id(int(subject))
        if user is None or not user.is_active:
            raise UnauthorizedError("Требуется вход")
        return user
