from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Identity, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.infrastructure.db.models.base import Base
from backend.infrastructure.db.models.requests import (
    REQUEST_STATUS_TYPE,
    RepairRequest,
    RequestStatus,
)
from backend.infrastructure.db.models.users import User


class RequestStatusHistory(Base):
    __tablename__ = "request_status_history"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    request_id: Mapped[int] = mapped_column(
        ForeignKey("requests.id", ondelete="CASCADE"), index=True
    )
    changed_by_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    old_status: Mapped[RequestStatus | None] = mapped_column(REQUEST_STATUS_TYPE)
    new_status: Mapped[RequestStatus] = mapped_column(REQUEST_STATUS_TYPE)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    request: Mapped[RepairRequest] = relationship()
    changed_by: Mapped[User] = relationship(lazy="joined")
