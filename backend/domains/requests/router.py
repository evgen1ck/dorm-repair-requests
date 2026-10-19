from typing import Annotated

from fastapi import APIRouter, Depends, status

from backend.domains.requests.dependencies import get_repair_request_service
from backend.domains.requests.schemas import RepairRequestCreate, RepairRequestResponse
from backend.domains.requests.service import RepairRequestService

router = APIRouter(prefix="/requests", tags=["requests"])

Service = Annotated[RepairRequestService, Depends(get_repair_request_service)]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_request(service: Service, body: RepairRequestCreate) -> RepairRequestResponse:
    return await service.create(body)


@router.get("")
async def list_requests(service: Service, resident_id: int) -> list[RepairRequestResponse]:
    return await service.list_by_resident(resident_id)


@router.get("/{request_id}")
async def get_request(service: Service, request_id: int) -> RepairRequestResponse:
    return await service.get(request_id)
