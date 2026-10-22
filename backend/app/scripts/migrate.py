"""提供应用已纳入版本管理的 Alembic 数据库迁移的辅助方法。"""

from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory

from app.common.enums import EnvironmentEnum
from app.config.path_conf import BASE_DIR


async def migrate_database(environment: EnvironmentEnum) -> None:
    """管理 CLI 的 Redis 连接，仅由父进程持有启动锁。"""
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
    """将所有已纳入版本管理的 Alembic 迁移应用到配置指向的数据库。

    此操作会执行尚未应用的结构和数据迁移，可能修改目标数据库。

    Returns:
        bool: 是否存在迁移版本并已调用升级操作。
    """
    alembic_config = Config(str(BASE_DIR / "alembic.ini"))
    script = ScriptDirectory.from_config(alembic_config)
    if not script.get_heads():
        return False

    command.upgrade(alembic_config, "head")
    return True
