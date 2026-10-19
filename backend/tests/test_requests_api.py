import pytest

from backend.infrastructure.db.models import FaultType, Room, User, UserRole


async def add(session_factory, entity):
    async with session_factory() as session:
        session.add(entity)
        await session.commit()
        await session.refresh(entity)
        return entity


@pytest.fixture
async def resident(session_factory):
    return await add(
        session_factory,
        User(role=UserRole.RESIDENT, login="ivan", password_hash="x", full_name="Иван"),
    )


@pytest.fixture
async def room(session_factory):
    return await add(session_factory, Room(building="1", number="101", floor=1))


@pytest.fixture
async def fault_type(session_factory):
    return await add(session_factory, FaultType(code="plumbing", name="Сантехника"))


def payload(resident, room, fault_type, **overrides):
    return {
        "resident_id": resident.id,
        "room_id": room.id,
        "fault_type_id": fault_type.id,
        "fault_description": "Течёт кран",
        **overrides,
    }


async def test_create_and_get_request(client, resident, room, fault_type):
    created = await client.post("/api/v1/requests", json=payload(resident, room, fault_type))
    assert created.status_code == 201
    body = created.json()
    assert body["status"] == "new"
    assert body["room"]["number"] == "101"
    assert body["fault_type"]["name"] == "Сантехника"

    fetched = await client.get(f"/api/v1/requests/{body['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == body


async def test_list_returns_resident_requests_newest_first(client, resident, room, fault_type):
    body = payload(resident, room, fault_type)
    first = (await client.post("/api/v1/requests", json=body)).json()
    second = (await client.post("/api/v1/requests", json=body)).json()

    listed = await client.get("/api/v1/requests", params={"resident_id": resident.id})
    assert [item["id"] for item in listed.json()] == [second["id"], first["id"]]


async def test_description_is_stripped(client, resident, room, fault_type):
    created = await client.post(
        "/api/v1/requests",
        json=payload(resident, room, fault_type, fault_description="  Течёт кран  "),
    )
    assert created.json()["fault_description"] == "Течёт кран"


async def test_blank_description_is_rejected(client, resident, room, fault_type):
    created = await client.post(
        "/api/v1/requests", json=payload(resident, room, fault_type, fault_description="   ")
    )
    assert created.status_code == 422


async def test_unknown_room_returns_404(client, resident, room, fault_type):
    created = await client.post(
        "/api/v1/requests", json=payload(resident, room, fault_type, room_id=999)
    )
    assert created.status_code == 404
    assert created.json() == {"detail": "Комната не найдена"}


async def test_unknown_resident_returns_404(client, resident, room, fault_type):
    created = await client.post(
        "/api/v1/requests", json=payload(resident, room, fault_type, resident_id=999)
    )
    assert created.status_code == 404
    assert created.json() == {"detail": "Жилец не найден"}


async def test_unknown_fault_type_returns_404(client, resident, room, fault_type):
    created = await client.post(
        "/api/v1/requests", json=payload(resident, room, fault_type, fault_type_id=999)
    )
    assert created.status_code == 404
    assert created.json() == {"detail": "Тип неисправности не найден"}


async def test_inactive_fault_type_returns_404(client, session_factory, resident, room):
    inactive = await add(session_factory, FaultType(code="old", name="Старое", is_active=False))
    created = await client.post("/api/v1/requests", json=payload(resident, room, inactive))
    assert created.status_code == 404
    assert created.json() == {"detail": "Тип неисправности не найден"}


async def test_non_resident_is_forbidden(client, session_factory, room, fault_type):
    master = await add(
        session_factory,
        User(role=UserRole.MASTER, login="master", password_hash="x", full_name="Мастер"),
    )
    created = await client.post("/api/v1/requests", json=payload(master, room, fault_type))
    assert created.status_code == 403


async def test_missing_request_returns_404(client):
    assert (await client.get("/api/v1/requests/999")).status_code == 404
