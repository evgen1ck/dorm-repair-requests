from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Identity, Index, Integer, func, text, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.infrastructure.db.models.base import Base
from backend.infrastructure.db.models.users import User


class Assignment(Base):
    __tablename__ = "assignments"
    __table_args__ = (
        Index(
            "uq_assignments_active_request",
            "request_id",
            unique=True,
            postgresql_where=text("is_active"),
            sqlite_where=text("is_active"),
        ),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    dispatcher_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), index=True
    )
    request_id: Mapped[int] = mapped_column(
        ForeignKey("requests.id", ondelete="CASCADE"), index=True
    )
    master_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())

    dispatcher: Mapped[User] = relationship(foreign_keys=[dispatcher_id], lazy="joined")
    master: Mapped[User] = relationship(foreign_keys=[master_id], lazy="joined")
