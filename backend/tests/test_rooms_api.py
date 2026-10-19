from backend.infrastructure.db.models import Room


async def test_rooms_are_sorted_by_building_and_number(client, session_factory):
    async with session_factory() as session:
        session.add_all(
            [
                Room(building="2", number="101", floor=1),
                Room(building="1", number="305", floor=3),
                Room(building="1", number="101", floor=1),
            ]
        )
        await session.commit()

    response = await client.get("/api/v1/rooms")
    assert response.status_code == 200
    assert [(r["building"], r["number"]) for r in response.json()] == [
        ("1", "101"),
        ("1", "305"),
        ("2", "101"),
    ]
