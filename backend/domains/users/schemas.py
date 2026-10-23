from typing import Annotated

from pydantic import MISSING, BaseModel, Field, StringConstraints

from backend.domains.auth.schemas import Login, Password
from backend.infrastructure.db.models import UserRole

FullName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
Phone = Annotated[str, StringConstraints(strip_whitespace=True, max_length=20)]
NewPassword = Annotated[Password, Field(min_length=8)]


class UserCreate(BaseModel):
    login: Login
    password: NewPassword
    full_name: FullName
    phone: Phone | None = None
    role: UserRole


class UserUpdate(BaseModel):
    full_name: FullName | MISSING = MISSING
    phone: Phone | MISSING | None = MISSING
    role: UserRole | MISSING = MISSING
    is_active: bool | MISSING = MISSING
    password: NewPassword | MISSING = MISSING
