"""Helpers for applying committed Alembic database migrations."""

from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory

from app.common.enums import EnvironmentEnum
from app.config.path_conf import BASE_DIR


async def migrate_database(environment: EnvironmentEnum) -> None:
    """Own the CLI Redis connection; the parent alone holds the startup lock."""
    from redis.asyncio import Redis

    from app.config.setting import get_settings
    from app.init_app import bootstrap_database

    settings = get_settings()
    if not settings.REDIS_ENABLE:
        raise RuntimeError("数据库迁移需要 Redis 启动锁，REDIS_ENABLE 必须为 true")
    redis = Redis.from_url(settings.REDIS_URI, decode_responses=True, socket_timeout=settings.POOL_TIMEOUT)
    try:
        await redis.ping()
        await bootstrap_database(redis, environment=environment, migrate_only=True)
    finally:
        await redis.aclose()


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
