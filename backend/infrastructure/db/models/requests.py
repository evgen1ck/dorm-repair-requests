import enum
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Identity, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.infrastructure.db.models.base import Base, db_enum
from backend.infrastructure.db.models.fault_types import FaultType
from backend.infrastructure.db.models.rooms import Room


class RequestStatus(enum.StrEnum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class RepairRequest(Base):
    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    resident_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), index=True
    )
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="RESTRICT"), index=True)
    fault_type_id: Mapped[int] = mapped_column(
        ForeignKey("fault_types.id", ondelete="RESTRICT"), index=True
    )
    fault_description: Mapped[str] = mapped_column(Text)
    status: Mapped[RequestStatus] = mapped_column(
        db_enum(RequestStatus, "request_status"), server_default=RequestStatus.NEW.value
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    room: Mapped[Room] = relationship(lazy="joined")
    fault_type: Mapped[FaultType] = relationship(lazy="joined")
