import secrets
from datetime import UTC, datetime, timedelta
from functools import cache

import bcrypt
import jwt

TOKEN_ALGORITHM = "HS256"
MAX_PASSWORD_BYTES = 72


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


@cache
def unmatchable_password_hash() -> str:
    return hash_password(secrets.token_urlsafe(32))


def create_access_token(subject: str, secret_key: str, ttl: timedelta) -> str:
    issued_at = datetime.now(UTC)
    claims = {"sub": subject, "iat": issued_at, "exp": issued_at + ttl}
    return jwt.encode(claims, secret_key, algorithm=TOKEN_ALGORITHM)


def read_access_token_subject(token: str, secret_key: str) -> str | None:
    try:
        claims = jwt.decode(
            token,
            secret_key,
            algorithms=[TOKEN_ALGORITHM],
            options={"require": ["sub", "iat", "exp"]},
        )
    except jwt.InvalidTokenError:
        return None
    return claims["sub"]
