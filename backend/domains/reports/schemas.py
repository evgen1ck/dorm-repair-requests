from datetime import date
from typing import Self

from pydantic import BaseModel, ConfigDict, model_validator

from backend.domains.fault_types.schemas import FaultTypeResponse


class ReportPeriod(BaseModel):
    date_from: date
    date_to: date

    @model_validator(mode="after")
    def check_order(self) -> Self:
        if self.date_from > self.date_to:
            raise ValueError("date_from не может быть позже date_to")
        return self


class FaultTypeReportRow(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    fault_type: FaultTypeResponse
    total: int
    new: int
    in_progress: int
    done: int
