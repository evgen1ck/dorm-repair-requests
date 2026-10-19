from backend.infrastructure.db.models import FaultType
from backend.infrastructure.db.repositories.fault_types import FaultTypeRepository


class FaultTypeService:
    def __init__(self, fault_types: FaultTypeRepository) -> None:
        self._fault_types = fault_types

    async def list_active(self) -> list[FaultType]:
        return await self._fault_types.list_active()
