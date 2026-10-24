from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, StringConstraints

from backend.core.security import MAX_PASSWORD_BYTES
from backend.infrastructure.db.models import UserRole


def fits_password_hash(password: str) -> str:
    if len(password.encode()) > MAX_PASSWORD_BYTES:
        raise ValueError(f"пароль не должен быть длиннее {MAX_PASSWORD_BYTES} байт")
    return password


Login = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
Password = Annotated[str, Field(min_length=1), AfterValidator(fits_password_hash)]


class LoginRequest(BaseModel):
    login: Login
    password: Password


class PersonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    phone: str | None
    role: UserRole


class UserResponse(PersonResponse):
    login: str
    is_active: bool
