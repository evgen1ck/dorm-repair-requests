from pathlib import Path

from alembic import command
from alembic.config import Config as AlembicConfig

ALEMBIC_INI = Path(__file__).resolve().parents[2] / "alembic.ini"


def upgrade(revision: str = "head") -> None:
    command.upgrade(AlembicConfig(ALEMBIC_INI), revision)


def downgrade(revision: str = "-1") -> None:
    command.downgrade(AlembicConfig(ALEMBIC_INI), revision)


def create_revision(message: str, autogenerate: bool = True) -> None:
    command.revision(AlembicConfig(ALEMBIC_INI), message=message, autogenerate=autogenerate)
