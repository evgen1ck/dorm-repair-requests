from typing import Annotated

from fastapi import APIRouter, Depends

from backend.domains.fault_types.dependencies import get_fault_type_service
from backend.domains.fault_types.schemas import FaultTypeResponse
from backend.domains.fault_types.service import FaultTypeService

router = APIRouter(prefix="/fault-types", tags=["fault-types"])

Service = Annotated[FaultTypeService, Depends(get_fault_type_service)]


@router.get("")
async def list_fault_types(service: Service) -> list[FaultTypeResponse]:
    return await service.list_active()
