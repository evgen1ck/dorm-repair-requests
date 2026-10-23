from backend.infrastructure.db.models import FaultType


async def test_lists_only_active_fault_types_in_insertion_order(
    client, session_factory, login, resident
):
    async with session_factory() as session:
        session.add_all(
            [
                FaultType(code="plumbing", name="Сантехника"),
                FaultType(code="old", name="Старое", is_active=False),
                FaultType(code="other", name="Другое"),
            ]
        )
        await session.commit()
    await login(resident)

    response = await client.get("/api/v1/fault-types")
    assert response.status_code == 200
    assert [t["code"] for t in response.json()] == ["plumbing", "other"]


async def test_fault_types_require_login(client):
    assert (await client.get("/api/v1/fault-types")).status_code == 401
