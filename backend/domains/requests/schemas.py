from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

from backend.domains.fault_types.schemas import FaultTypeResponse
from backend.domains.rooms.schemas import RoomResponse
from backend.infrastructure.db.models import RequestStatus

FaultDescription = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)
]


class RepairRequestCreate(BaseModel):
    resident_id: int
    room_id: int
    fault_type_id: int
    fault_description: FaultDescription


class RepairRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resident_id: int
    room: RoomResponse
    fault_type: FaultTypeResponse
    fault_description: str
    status: RequestStatus
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None
