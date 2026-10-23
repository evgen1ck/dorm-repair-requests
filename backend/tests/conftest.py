from zoneinfo import ZoneInfo

import bcrypt
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from backend.application.api.app import create_app
from backend.core.settings import Settings
from backend.domains.dependencies import get_session, get_settings
from backend.infrastructure.db.models import Base, FaultType, Room, User, UserRole

PASSWORD = "secret"
PASSWORD_HASH = bcrypt.hashpw(PASSWORD.encode(), bcrypt.gensalt(rounds=4)).decode()


@pytest.fixture
def password():
    return PASSWORD


@pytest.fixture
def settings():
    return Settings(
        postgres_user="test",
        postgres_password="test",
        postgres_db="test",
        secret_key="test-secret-key-at-least-32-bytes-long",
        timezone=ZoneInfo("Europe/Moscow"),
    )


@pytest.fixture
async def session_factory():
    engine = create_async_engine("sqlite+aiosqlite://")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield async_sessionmaker(engine, expire_on_commit=False)
    await engine.dispose()


@pytest.fixture
async def client(session_factory, settings):
    app = create_app()

    async def override_get_session():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_settings] = lambda: settings
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as http:
        yield http


@pytest.fixture
def add(session_factory):
    async def add_entity(entity):
        async with session_factory() as session:
            session.add(entity)
            await session.commit()
            await session.refresh(entity)
            return entity

    return add_entity


@pytest.fixture
def make_user(add):
    async def make(role: UserRole, login: str | None = None, **fields):
        login = login or role.value
        return await add(
            User(
                role=role,
                login=login,
                password_hash=PASSWORD_HASH,
                full_name=login.capitalize(),
                **fields,
            )
        )

    return make


@pytest.fixture
async def resident(make_user):
    return await make_user(UserRole.RESIDENT, "ivan")


@pytest.fixture
async def dispatcher(make_user):
    return await make_user(UserRole.DISPATCHER)


@pytest.fixture
async def master(make_user):
    return await make_user(UserRole.MASTER)


@pytest.fixture
async def admin(make_user):
    return await make_user(UserRole.ADMIN)


@pytest.fixture
async def room(add):
    return await add(Room(building="1", number="101", floor=1))


@pytest.fixture
async def fault_type(add):
    return await add(FaultType(code="plumbing", name="Сантехника"))


@pytest.fixture
def login(client, password):
    async def login_as(user: User):
        response = await client.post(
            "/api/v1/auth/login", json={"login": user.login, "password": password}
        )
        assert response.status_code == 200
        return response

    return login_as
