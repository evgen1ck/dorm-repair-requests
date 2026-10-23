from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi import status as http_status

from backend.domains.auth.dependencies import CurrentUser, DispatcherOrAdmin, Master, Resident
from backend.domains.requests.dependencies import get_repair_request_service
from backend.domains.requests.schemas import (
    AssignmentCreate,
    RepairRequestCreate,
    RepairRequestResponse,
    RequestStatusHistoryResponse,
    RequestStatusUpdate,
)
from backend.domains.requests.service import RepairRequestService
from backend.infrastructure.db.models import RequestStatus

router = APIRouter(prefix="/requests", tags=["requests"])

Service = Annotated[RepairRequestService, Depends(get_repair_request_service)]


@router.post("", status_code=http_status.HTTP_201_CREATED)
async def create_request(
    service: Service, resident: Resident, body: RepairRequestCreate
) -> RepairRequestResponse:
    return await service.create(resident, body)


@router.get("")
async def list_requests(
    service: Service, user: CurrentUser, status: RequestStatus | None = None
) -> list[RepairRequestResponse]:
    return await service.list_visible_to(user, status)


@router.get("/{request_id}")
async def get_request(
    service: Service, user: CurrentUser, request_id: int
) -> RepairRequestResponse:
    return await service.get(request_id, user)


@router.get("/{request_id}/history")
async def get_request_history(
    service: Service, user: CurrentUser, request_id: int
) -> list[RequestStatusHistoryResponse]:
    return await service.get_history(request_id, user)


@router.post("/{request_id}/assignments", status_code=http_status.HTTP_201_CREATED)
async def assign_request(
    service: Service, dispatcher: DispatcherOrAdmin, request_id: int, body: AssignmentCreate
) -> RepairRequestResponse:
    return await service.assign(request_id, dispatcher, body)


@router.patch("/{request_id}/status")
async def change_request_status(
    service: Service, master: Master, request_id: int, body: RequestStatusUpdate
) -> RepairRequestResponse:
    return await service.change_status(request_id, master, body)
