import asyncio
from typing import Annotated

import typer

from backend.application.api.app import run_api
from backend.application.commands import create_admin_user, seed_demo_data
from backend.core.settings import Settings
from backend.infrastructure.db.database import Database
from backend.migrations import runner as migrations

app = typer.Typer(name="dormitory", add_completion=False, no_args_is_help=True)
db_app = typer.Typer(help="Database management commands", no_args_is_help=True)
app.add_typer(db_app, name="db")


@app.command("run-api", help="Start FastAPI application")
def run_api_command(reload: Annotated[bool, typer.Option("--reload")] = False) -> None:
    run_api(reload)


@db_app.command("upgrade", help="Apply migrations (default: head)")
def db_upgrade(revision: Annotated[str, typer.Option("--revision", "-r")] = "head") -> None:
    migrations.upgrade(revision)


@db_app.command("downgrade", help="Revert migrations (default: -1)")
def db_downgrade(revision: Annotated[str, typer.Option("--revision", "-r")] = "-1") -> None:
    migrations.downgrade(revision)


@db_app.command("revision", help="Create a new migration revision")
def db_revision(
    message: Annotated[str, typer.Option("--message", "-m")],
    autogenerate: Annotated[bool, typer.Option("--autogenerate/--no-autogenerate")] = True,
) -> None:
    migrations.create_revision(message, autogenerate)


@db_app.command("seed", help="Create missing demo users (one per role) and rooms")
def db_seed() -> None:
    async def run() -> None:
        async with Database(Settings().database_url) as database:
            await seed_demo_data(database)

    asyncio.run(run())


@app.command("create-admin", help="Create an admin user")
def create_admin_command(
    login: Annotated[str, typer.Option("--login", "-l")],
    full_name: Annotated[str, typer.Option("--full-name", "-n")],
    password: Annotated[str, typer.Option(prompt=True, confirmation_prompt=True, hide_input=True)],
    phone: Annotated[str | None, typer.Option("--phone")] = None,
) -> None:
    async def run() -> None:
        async with Database(Settings().database_url) as database:
            await create_admin_user(database, login, password, full_name, phone)

    asyncio.run(run())


if __name__ == "__main__":
    app()
