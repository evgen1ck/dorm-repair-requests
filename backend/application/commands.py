import typer

from backend.core.security import hash_password
from backend.infrastructure.db.database import Database
from backend.infrastructure.db.models import Room, User, UserRole
from backend.infrastructure.db.repositories.rooms import RoomRepository
from backend.infrastructure.db.repositories.users import UserRepository

DEMO_USERS = [
    ("ivan", "Иван Петров", UserRole.RESIDENT),
    ("dispatcher", "Мария Смирнова", UserRole.DISPATCHER),
    ("master", "Сергей Кузнецов", UserRole.MASTER),
    ("admin", "Администратор", UserRole.ADMIN),
]
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
        new_users = [
            User(login=login, password_hash=hash_password(login), full_name=full_name, role=role)
            for login, full_name, role in DEMO_USERS
            if await users.get_by_login(login) is None
        ]
        new_rooms = (
            []
            if await rooms.list_all()
            else [Room(building=b, number=n, floor=f) for b, n, f in DEMO_ROOMS]
        )
        if not new_users and not new_rooms:
            typer.echo("Демо-данные уже есть.")
            return
        session.add_all(new_users + new_rooms)
        await session.commit()
    logins = ", ".join(f"'{user.login}'" for user in new_users) or "нет"
    typer.echo(f"Созданы пользователи: {logins} (пароль равен логину), комнат: {len(new_rooms)}.")
