"""Helpers for applying committed Alembic database migrations."""

from alembic.config import Config

from alembic import command
from app.config.path_conf import BASE_DIR


def upgrade_database() -> None:
    """Apply all committed Alembic migrations to the configured database.

    Returns:
        None.

    Side effects:
        Executes pending schema and data migrations against the configured
        database.
    """
    alembic_config = Config(str(BASE_DIR / "alembic.ini"))
    command.upgrade(alembic_config, "head")
