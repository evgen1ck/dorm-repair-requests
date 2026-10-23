from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from backend.infrastructure.db.models import FaultType, RepairRequest, RequestStatus

MOSCOW = ZoneInfo("Europe/Moscow")


def moscow(*args: int) -> datetime:
    return datetime(*args, tzinfo=MOSCOW).astimezone(UTC)


async def test_report_groups_requests_by_fault_type_within_local_period(
    client, login, add, dispatcher, resident, room, fault_type
):
    electrical = await add(FaultType(code="electrical", name="Электрика"))
    await add(FaultType(code="furniture", name="Мебель"))
    for status, created_at, kind in [
        (RequestStatus.NEW, moscow(2026, 10, 1, 0, 0), fault_type),
        (RequestStatus.DONE, moscow(2026, 10, 31, 23, 59), fault_type),
        (RequestStatus.IN_PROGRESS, moscow(2026, 10, 15, 12, 0), electrical),
        (RequestStatus.DONE, moscow(2026, 11, 1, 0, 0), electrical),
        (RequestStatus.NEW, moscow(2026, 9, 30, 23, 59), fault_type),
    ]:
        await add(
            RepairRequest(
                resident_id=resident.id,
                room_id=room.id,
                fault_type_id=kind.id,
                fault_description="x",
                status=status,
                created_at=created_at,
            )
        )
    await login(dispatcher)

    response = await client.get(
        "/api/v1/reports/fault-types", params={"date_from": "2026-10-01", "date_to": "2026-10-31"}
    )
    assert response.status_code == 200
    assert [
        (row["fault_type"]["code"], row["total"], row["new"], row["in_progress"], row["done"])
        for row in response.json()
    ] == [("plumbing", 2, 1, 0, 1), ("electrical", 1, 0, 1, 0), ("furniture", 0, 0, 0, 0)]


async def test_reversed_period_is_rejected(client, login, dispatcher):
    await login(dispatcher)
    response = await client.get(
        "/api/v1/reports/fault-types", params={"date_from": "2026-10-31", "date_to": "2026-10-01"}
    )
    assert response.status_code == 422


async def test_report_is_not_available_to_residents(client, login, resident):
    await login(resident)
    response = await client.get(
        "/api/v1/reports/fault-types", params={"date_from": "2026-10-01", "date_to": "2026-10-31"}
    )
    assert response.status_code == 403
