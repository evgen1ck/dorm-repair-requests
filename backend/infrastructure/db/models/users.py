import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Identity, Integer, String, Text, func, true
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.db.models.base import Base, db_enum


class UserRole(enum.StrEnum):
    ADMIN = "admin"
    RESIDENT = "resident"
    DISPATCHER = "dispatcher"
    MASTER = "master"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    role: Mapped[UserRole] = mapped_column(db_enum(UserRole, "user_role"))
    login: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(Text)
    full_name: Mapped[str] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
