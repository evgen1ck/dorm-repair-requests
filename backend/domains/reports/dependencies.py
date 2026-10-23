from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.settings import Settings
from backend.domains.dependencies import get_session, get_settings
from backend.domains.reports.service import ReportService
from backend.infrastructure.db.repositories.requests import RepairRequestRepository


def get_report_service(
    session: Annotated[AsyncSession, Depends(get_session)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> ReportService:
    return ReportService(RepairRequestRepository(session), settings.timezone)
