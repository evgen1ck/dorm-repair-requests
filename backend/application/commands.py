import typer

from backend.core.security import hash_password
from backend.infrastructure.db.database import Database
from backend.infrastructure.db.models import Room, User, UserRole
from backend.infrastructure.db.repositories.rooms import RoomRepository
from backend.infrastructure.db.repositories.users import UserRepository

DEMO_RESIDENT_LOGIN = "ivan"
DEMO_ROOMS = [("1", "101", 1), ("1", "214", 2), ("1", "305а", 3), ("2", "112", 1)]


async def create_admin_user(
    database: Database, login: str, password: str, full_name: str, phone: str | None = None
) -> None:
    async with database.session_factory() as session:
        users = UserRepository(session)
        if await users.get_by_login(login) is not None:
            typer.echo(f"Пользователь '{login}' уже существует.")
            return
        users.add(
            User(
                login=login,
                password_hash=hash_password(password),
                full_name=full_name,
                phone=phone,
                role=UserRole.ADMIN,
            )
        )
        await session.commit()
    typer.echo(f"Администратор '{login}' создан.")


async def seed_demo_data(database: Database) -> None:
    async with database.session_factory() as session:
        users = UserRepository(session)
        rooms = RoomRepository(session)
        if await users.get_by_login(DEMO_RESIDENT_LOGIN) is not None or await rooms.list_all():
            typer.echo("Демо-данные уже есть.")
            return
        users.add(
            User(
                login=DEMO_RESIDENT_LOGIN,
                password_hash=hash_password(DEMO_RESIDENT_LOGIN),
                full_name="Иван Петров",
                role=UserRole.RESIDENT,
            )
        )
        for building, number, floor in DEMO_ROOMS:
            session.add(Room(building=building, number=number, floor=floor))
        await session.commit()
    typer.echo(f"Создан жилец '{DEMO_RESIDENT_LOGIN}' и {len(DEMO_ROOMS)} комнаты.")
