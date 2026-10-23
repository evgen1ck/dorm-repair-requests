from typing import Annotated

from fastapi import APIRouter, Depends, Query

from backend.domains.auth.dependencies import DispatcherOrAdmin
from backend.domains.reports.dependencies import get_report_service
from backend.domains.reports.schemas import FaultTypeReportRow, ReportPeriod
from backend.domains.reports.service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])

Service = Annotated[ReportService, Depends(get_report_service)]


@router.get("/fault-types")
async def requests_by_fault_type(
    service: Service, _: DispatcherOrAdmin, period: Annotated[ReportPeriod, Query()]
) -> list[FaultTypeReportRow]:
    return await service.requests_by_fault_type(period)
