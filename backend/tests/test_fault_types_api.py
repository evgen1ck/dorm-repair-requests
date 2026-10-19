from backend.infrastructure.db.models import FaultType


async def test_lists_only_active_fault_types_in_insertion_order(client, session_factory):
    async with session_factory() as session:
        session.add_all(
            [
                FaultType(code="plumbing", name="Сантехника"),
                FaultType(code="old", name="Старое", is_active=False),
                FaultType(code="other", name="Другое"),
            ]
        )
        await session.commit()

    response = await client.get("/api/v1/fault-types")
    assert response.status_code == 200
    assert [t["code"] for t in response.json()] == ["plumbing", "other"]
