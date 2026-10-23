from datetime import datetime
from typing import Annotated

from pydantic import AwareDatetime, BaseModel, ConfigDict, StringConstraints

from backend.domains.auth.schemas import UserResponse
from backend.domains.fault_types.schemas import FaultTypeResponse
from backend.domains.rooms.schemas import RoomResponse
from backend.infrastructure.db.models import RequestStatus

FaultDescription = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)
]


class RepairRequestCreate(BaseModel):
    room_id: int
    fault_type_id: int
    fault_description: FaultDescription


class AssignmentCreate(BaseModel):
    master_id: int
    due_at: AwareDatetime


class RequestStatusUpdate(BaseModel):
    status: RequestStatus


class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dispatcher: UserResponse
    master: UserResponse
    due_at: datetime
    created_at: datetime


class RepairRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resident_id: int
    room: RoomResponse
    fault_type: FaultTypeResponse
    fault_description: str
    status: RequestStatus
    active_assignment: AssignmentResponse | None
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None


class RequestStatusHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    changed_by: UserResponse
    old_status: RequestStatus | None
    new_status: RequestStatus
    changed_at: datetime
