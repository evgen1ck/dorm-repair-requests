from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.domains.dependencies import get_session
from backend.domains.fault_types.service import FaultTypeService
from backend.infrastructure.db.repositories.fault_types import FaultTypeRepository


def get_fault_type_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> FaultTypeService:
    return FaultTypeService(FaultTypeRepository(session))
