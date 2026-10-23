from datetime import UTC, date, datetime, time, timedelta, tzinfo

from backend.domains.reports.schemas import FaultTypeReportRow, ReportPeriod
from backend.infrastructure.db.repositories.requests import RepairRequestRepository


def local_midnight(day: date, timezone: tzinfo) -> datetime:
    return datetime.combine(day, time.min, tzinfo=timezone).astimezone(UTC)


class ReportService:
    def __init__(self, requests: RepairRequestRepository, timezone: tzinfo) -> None:
        self._requests = requests
        self._timezone = timezone

    async def requests_by_fault_type(self, period: ReportPeriod) -> list[FaultTypeReportRow]:
        rows = await self._requests.count_by_fault_type(
            local_midnight(period.date_from, self._timezone),
            local_midnight(period.date_to + timedelta(days=1), self._timezone),
        )
        return [FaultTypeReportRow.model_validate(row) for row in rows]
