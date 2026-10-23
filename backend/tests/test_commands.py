import bcrypt
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine

from backend.application.commands import (
    DEMO_ROOMS,
    DEMO_USERS,
    create_admin_user,
    seed_demo_data,
)
from backend.infrastructure.db.database import Database
from backend.infrastructure.db.models import Base, Room, User, UserRole


@pytest.fixture
async def database_url(tmp_path):
    url = f"sqlite+aiosqlite:///{tmp_path / 'test.db'}"
    engine = create_async_engine(url)
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    await engine.dispose()
    return url


async def list_users(url):
    engine = create_async_engine(url)
    try:
        async with engine.connect() as connection:
            return list((await connection.execute(select(User))).mappings())
    finally:
        await engine.dispose()


async def test_create_admin_stores_hashed_password(database_url, capsys):
    async with Database(database_url) as database:
        await create_admin_user(database, "admin", "secret", "Админ")

    (user,) = await list_users(database_url)
    assert user["role"] == UserRole.ADMIN
    assert bcrypt.checkpw(b"secret", user["password_hash"].encode())
    assert "создан" in capsys.readouterr().out


async def test_seed_creates_demo_users_and_rooms_once(database_url, capsys):
    async with Database(database_url) as database:
        await seed_demo_data(database)
        await seed_demo_data(database)

    users = await list_users(database_url)
    assert [(user["login"], user["role"]) for user in users] == [
        (login, role) for login, _, role in DEMO_USERS
    ]
    assert users[0]["id"] == 1
    assert all(
        bcrypt.checkpw(user["login"].encode(), user["password_hash"].encode()) for user in users
    )
    engine = create_async_engine(database_url)
    try:
        async with engine.connect() as connection:
            rooms = (await connection.execute(select(Room))).all()
    finally:
        await engine.dispose()
    assert len(rooms) == len(DEMO_ROOMS)
    assert "уже есть" in capsys.readouterr().out


async def test_seed_fills_in_missing_demo_users(database_url, capsys):
    async with Database(database_url) as database:
        await create_admin_user(database, "admin", "secret", "Админ")
        await seed_demo_data(database)

    users = await list_users(database_url)
    assert sorted(user["login"] for user in users) == sorted(login for login, _, _ in DEMO_USERS)
    assert bcrypt.checkpw(
        b"secret", next(u for u in users if u["login"] == "admin")["password_hash"].encode()
    )
    assert "Созданы пользователи: 'ivan', 'dispatcher', 'master' " in capsys.readouterr().out


async def test_create_admin_skips_existing_login(database_url, capsys):
    async with Database(database_url) as database:
        await create_admin_user(database, "admin", "secret", "Админ")
        await create_admin_user(database, "admin", "other", "Другой")

    assert len(await list_users(database_url)) == 1
    assert "уже существует" in capsys.readouterr().out
