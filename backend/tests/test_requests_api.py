from datetime import UTC, datetime

import pytest

from backend.infrastructure.db.models import FaultType, UserRole

DUE_AT = datetime(2026, 11, 1, 12, tzinfo=UTC)


def payload(room, fault_type, **overrides):
    return {
        "room_id": room.id,
        "fault_type_id": fault_type.id,
        "fault_description": "Течёт кран",
        **overrides,
    }


@pytest.fixture
def create_request(client, login, resident, room, fault_type):
    async def create_as_resident(**overrides):
        await login(resident)
        response = await client.post(
            "/api/v1/requests", json=payload(room, fault_type, **overrides)
        )
        assert response.status_code == 201
        return response.json()

    return create_as_resident


@pytest.fixture
def assign(client, login, dispatcher, master):
    async def assign_as_dispatcher(request_id, master_id=master.id, due_at=DUE_AT):
        await login(dispatcher)
        return await client.post(
            f"/api/v1/requests/{request_id}/assignments",
            json={"master_id": master_id, "due_at": due_at.isoformat()},
        )

    return assign_as_dispatcher


async def test_create_and_get_request(client, login, resident, room, fault_type):
    await login(resident)
    created = await client.post("/api/v1/requests", json=payload(room, fault_type))
    assert created.status_code == 201
    body = created.json()
    assert body["status"] == "new"
    assert body["resident_id"] == resident.id
    assert body["room"]["number"] == "101"
    assert body["fault_type"]["name"] == "Сантехника"
    assert body["active_assignment"] is None

    fetched = await client.get(f"/api/v1/requests/{body['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == body


async def test_resident_lists_only_own_requests_newest_first(
    client, login, make_user, resident, room, fault_type, create_request
):
    first = await create_request()
    second = await create_request()
    await login(await make_user(UserRole.RESIDENT, "other"))
    await client.post("/api/v1/requests", json=payload(room, fault_type))
    assert len((await client.get("/api/v1/requests")).json()) == 1

    await login(resident)
    listed = await client.get("/api/v1/requests")
    assert [item["id"] for item in listed.json()] == [second["id"], first["id"]]


async def test_description_is_stripped(create_request):
    created = await create_request(fault_description="  Течёт кран  ")
    assert created["fault_description"] == "Течёт кран"


async def test_blank_description_is_rejected(client, login, resident, room, fault_type):
    await login(resident)
    created = await client.post(
        "/api/v1/requests", json=payload(room, fault_type, fault_description="   ")
    )
    assert created.status_code == 422


async def test_unknown_room_returns_404(client, login, resident, room, fault_type):
    await login(resident)
    created = await client.post("/api/v1/requests", json=payload(room, fault_type, room_id=999))
    assert created.status_code == 404
    assert created.json() == {"detail": "Комната не найдена"}


async def test_unknown_fault_type_returns_404(client, login, resident, room, fault_type):
    await login(resident)
    created = await client.post(
        "/api/v1/requests", json=payload(room, fault_type, fault_type_id=999)
    )
    assert created.status_code == 404
    assert created.json() == {"detail": "Тип неисправности не найден"}


async def test_inactive_fault_type_returns_404(client, login, add, resident, room):
    inactive = await add(FaultType(code="old", name="Старое", is_active=False))
    await login(resident)
    created = await client.post("/api/v1/requests", json=payload(room, inactive))
    assert created.status_code == 404
    assert created.json() == {"detail": "Тип неисправности не найден"}


async def test_only_resident_can_create(client, login, master, room, fault_type):
    await login(master)
    created = await client.post("/api/v1/requests", json=payload(room, fault_type))
    assert created.status_code == 403


async def test_create_requires_login(client, room, fault_type):
    created = await client.post("/api/v1/requests", json=payload(room, fault_type))
    assert created.status_code == 401


async def test_missing_request_returns_404(client, login, dispatcher):
    await login(dispatcher)
    assert (await client.get("/api/v1/requests/999")).status_code == 404


async def test_resident_cannot_view_foreign_request(client, login, make_user, create_request):
    created = await create_request()
    await login(await make_user(UserRole.RESIDENT, "other"))
    response = await client.get(f"/api/v1/requests/{created['id']}")
    assert response.status_code == 403


async def test_dispatcher_sees_queue_filtered_by_status(client, create_request, assign):
    queued = await create_request()
    assigned = await create_request()
    await assign(assigned["id"])

    everything = await client.get("/api/v1/requests")
    assert [item["id"] for item in everything.json()] == [assigned["id"], queued["id"]]

    new_only = await client.get("/api/v1/requests", params={"status": "new"})
    assert [item["id"] for item in new_only.json()] == [queued["id"]]


async def test_assignment_moves_request_to_in_progress(dispatcher, master, create_request, assign):
    created = await create_request()
    response = await assign(created["id"])
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "in_progress"
    assignment = body["active_assignment"]
    assert assignment["master"]["id"] == master.id
    assert assignment["dispatcher"]["id"] == dispatcher.id
    assert assignment["due_at"].startswith("2026-11-01T12:00:00")


async def test_reassignment_replaces_active_assignment(
    client, login, make_user, master, create_request, assign
):
    created = await create_request()
    await assign(created["id"])
    other_master = await make_user(UserRole.MASTER, "other_master")
    response = await assign(created["id"], master_id=other_master.id)
    assert response.json()["active_assignment"]["master"]["id"] == other_master.id

    await login(master)
    assert (await client.get("/api/v1/requests")).json() == []
    await login(other_master)
    assert [item["id"] for item in (await client.get("/api/v1/requests")).json()] == [created["id"]]


async def test_assignment_requires_active_master(make_user, resident, create_request, assign):
    created = await create_request()
    assert (await assign(created["id"], master_id=resident.id)).status_code == 404
    inactive = await make_user(UserRole.MASTER, "inactive", is_active=False)
    assert (await assign(created["id"], master_id=inactive.id)).status_code == 404


async def test_naive_due_at_is_rejected(create_request, assign):
    created = await create_request()
    response = await assign(created["id"], due_at=DUE_AT.replace(tzinfo=None))
    assert response.status_code == 422


async def test_resident_cannot_assign(client, login, resident, master, create_request):
    created = await create_request()
    await login(resident)
    response = await client.post(
        f"/api/v1/requests/{created['id']}/assignments",
        json={"master_id": master.id, "due_at": DUE_AT.isoformat()},
    )
    assert response.status_code == 403


async def test_master_closes_and_reopens_request(client, login, master, create_request, assign):
    created = await create_request()
    await assign(created["id"])
    await login(master)

    done = await client.patch(f"/api/v1/requests/{created['id']}/status", json={"status": "done"})
    assert done.status_code == 200
    assert done.json()["status"] == "done"
    assert done.json()["closed_at"] is not None

    reopened = await client.patch(
        f"/api/v1/requests/{created['id']}/status", json={"status": "in_progress"}
    )
    assert reopened.json()["status"] == "in_progress"
    assert reopened.json()["closed_at"] is None


async def test_closed_request_cannot_be_assigned(client, login, master, create_request, assign):
    created = await create_request()
    await assign(created["id"])
    await login(master)
    await client.patch(f"/api/v1/requests/{created['id']}/status", json={"status": "done"})

    response = await assign(created["id"])
    assert response.status_code == 409
    assert response.json() == {"detail": "Заявка уже закрыта"}


async def test_master_cannot_set_same_status(client, login, master, create_request, assign):
    created = await create_request()
    await assign(created["id"])
    await login(master)
    response = await client.patch(
        f"/api/v1/requests/{created['id']}/status", json={"status": "in_progress"}
    )
    assert response.status_code == 409


async def test_master_cannot_touch_foreign_request(
    client, login, make_user, create_request, assign
):
    created = await create_request()
    await assign(created["id"])
    await login(await make_user(UserRole.MASTER, "other_master"))
    response = await client.patch(
        f"/api/v1/requests/{created['id']}/status", json={"status": "done"}
    )
    assert response.status_code == 403


async def test_history_records_every_status_change(
    client, login, resident, dispatcher, master, create_request, assign
):
    created = await create_request()
    await assign(created["id"])
    await login(master)
    await client.patch(f"/api/v1/requests/{created['id']}/status", json={"status": "done"})

    await login(resident)
    response = await client.get(f"/api/v1/requests/{created['id']}/history")
    assert response.status_code == 200
    assert [
        (entry["old_status"], entry["new_status"], entry["changed_by"]["id"])
        for entry in response.json()
    ] == [
        (None, "new", resident.id),
        ("new", "in_progress", dispatcher.id),
        ("in_progress", "done", master.id),
    ]
    changed_at = [datetime.fromisoformat(entry["changed_at"]) for entry in response.json()]
    assert changed_at == sorted(changed_at)
