from sqlalchemy import Identity, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.db.models.base import Base


class Room(Base):
    __tablename__ = "rooms"
    __table_args__ = (UniqueConstraint("building", "number"),)

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    building: Mapped[str] = mapped_column(String(50))
    number: Mapped[str] = mapped_column(String(10))
    floor: Mapped[int] = mapped_column(Integer)
