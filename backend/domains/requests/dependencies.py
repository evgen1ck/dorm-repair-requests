from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.domains.dependencies import get_session
from backend.domains.requests.service import RepairRequestService
from backend.infrastructure.db.repositories.assignments import AssignmentRepository
from backend.infrastructure.db.repositories.fault_types import FaultTypeRepository
from backend.infrastructure.db.repositories.request_status_history import (
    RequestStatusHistoryRepository,
)
from backend.infrastructure.db.repositories.requests import RepairRequestRepository
from backend.infrastructure.db.repositories.rooms import RoomRepository
from backend.infrastructure.db.repositories.users import UserRepository


def get_repair_request_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> RepairRequestService:
    return RepairRequestService(
        session,
        RepairRequestRepository(session),
        AssignmentRepository(session),
        RequestStatusHistoryRepository(session),
        UserRepository(session),
        RoomRepository(session),
        FaultTypeRepository(session),
    )
