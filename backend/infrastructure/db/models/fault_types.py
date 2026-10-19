from sqlalchemy import Boolean, Identity, Integer, String, true
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.db.models.base import Base


class FaultType(Base):
    __tablename__ = "fault_types"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())
