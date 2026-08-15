"""Helpers for applying committed Alembic database migrations."""

from alembic.config import Config
from alembic.script import ScriptDirectory

from alembic import command
from app.config.path_conf import BASE_DIR


def upgrade_database() -> bool:
    """Apply all committed Alembic migrations to the configured database.

    Returns:
        bool: Whether a migration head was found and the upgrade was invoked.

    Side effects:
        Executes pending schema and data migrations against the configured
        database.
    """
    alembic_config = Config(str(BASE_DIR / "alembic.ini"))
    script = ScriptDirectory.from_config(alembic_config)
    if not script.get_heads():
        return False

    command.upgrade(alembic_config, "head")
    return True
