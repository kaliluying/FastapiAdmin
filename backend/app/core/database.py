from fastapi import FastAPI
from redis import exceptions
from redis.asyncio import Redis
from sqlalchemy import Engine, Index, create_engine, inspect
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import sessionmaker

from app.config.setting import settings
from app.core.base_model import MappedBase
from app.core.exceptions import CustomException
from app.core.logger import logger


def create_engine_and_session(
    db_url: str = settings.DB_URI,
) -> tuple[Engine, sessionmaker]:
    """
    创建同步数据库引擎和会话工厂。

    参数:
    - db_url (str): 数据库连接URL,默认从配置中获取。

    返回:
    - tuple[Engine, sessionmaker]: 同步数据库引擎和会话工厂。
    """
    try:
        if not settings.SQL_DB_ENABLE:
            raise CustomException(
                msg="请先开启数据库连接",
                data="请启用 app/config/setting.py: SQL_DB_ENABLE",
            )
        # 同步数据库引擎
        engine: Engine = create_engine(
            url=db_url,
            echo=settings.DATABASE_ECHO,
            pool_pre_ping=settings.POOL_PRE_PING,
            pool_recycle=settings.POOL_RECYCLE,
        )
    except Exception as e:
        logger.error(f"❌ 数据库连接失败 {e}")
        raise
    else:
        # 同步数据库会话工厂
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        return engine, SessionLocal


def create_async_engine_and_session(
    db_url: str = settings.ASYNC_DB_URI,
) -> tuple[AsyncEngine, async_sessionmaker[AsyncSession]]:
    """
    获取异步数据库会话连接。

    参数:
    - db_url (str): 异步数据库 URL，默认取配置项 ASYNC_DB_URI。

    返回:
    - tuple[AsyncEngine, async_sessionmaker[AsyncSession]]: 异步数据库引擎和会话工厂。
    """
    try:
        if not settings.SQL_DB_ENABLE:
            raise CustomException(
                msg="请先开启数据库连接",
                data="请启用 app/config/setting.py: SQL_DB_ENABLE",
            )
        # 异步数据库引擎
        if settings.DATABASE_TYPE == "sqlite":
            async_engine = create_async_engine(
                url=db_url,
                echo=settings.DATABASE_ECHO,
                echo_pool=settings.ECHO_POOL,
                pool_pre_ping=settings.POOL_PRE_PING,
                future=settings.FUTURE,
                pool_recycle=settings.POOL_RECYCLE,
            )
        else:
            async_engine = create_async_engine(
                url=db_url,
                echo=settings.DATABASE_ECHO,
                echo_pool=settings.ECHO_POOL,
                pool_pre_ping=settings.POOL_PRE_PING,
                future=settings.FUTURE,
                pool_recycle=settings.POOL_RECYCLE,
                pool_size=settings.POOL_SIZE,
                max_overflow=settings.MAX_OVERFLOW,
                pool_timeout=settings.POOL_TIMEOUT,
                pool_use_lifo=settings.POOL_USE_LIFO,
            )
    except Exception as e:
        logger.error(f"❌ 数据库连接失败 {e}")
        raise
    else:
        # 异步数据库会话工厂
        AsyncSessionLocal = async_sessionmaker[AsyncSession](
            bind=async_engine,
            autocommit=settings.AUTOCOMMIT,
            autoflush=settings.AUTOFLUSH if settings.AUTOFETCH is None else settings.AUTOFETCH,
            expire_on_commit=settings.EXPIRE_ON_COMMIT,
            class_=AsyncSession,
        )
        return async_engine, AsyncSessionLocal


engine, db_session = create_engine_and_session(settings.DB_URI)
async_engine, async_db_session = create_async_engine_and_session(settings.ASYNC_DB_URI)


async def create_tables() -> None:
    """
    创建数据库表（根据 ORM metadata）。

    返回:
    - None
    """
    async with async_engine.begin() as coon:
        await coon.run_sync(MappedBase.metadata.create_all)


async def create_optional_plugin_tables() -> None:
    """Create missing tables owned by optional plugins.

    The core schema is managed by Alembic in production. Optional plugins can
    be enabled after the database has already reached the current Alembic
    head, so their tables need a narrowly scoped ``create_all`` pass at
    startup. Disabled plugins contribute no models and therefore no tables.

    Returns:
        None.
    """
    from app.core.plugins import load_ai_models

    plugin_models = load_ai_models()
    if not plugin_models:
        return

    plugin_tables = [model.__table__ for model in plugin_models]
    async with async_engine.begin() as connection:
        await connection.run_sync(
            lambda sync_connection: MappedBase.metadata.create_all(
                bind=sync_connection,
                tables=plugin_tables,
            )
        )


_CORE_SCHEMA_INDEXES: list[Index] | None = None
_AI_SCHEMA_INDEXES: list[Index] | None = None


def _get_schema_indexes(include_ai: bool) -> list[Index]:
    """Return one stable set of optional composite index definitions."""
    global _AI_SCHEMA_INDEXES, _CORE_SCHEMA_INDEXES
    if _CORE_SCHEMA_INDEXES is None:
        from app.api.v1.module_system.role.model import RoleMenusModel
        from app.api.v1.module_system.user.model import UserRolesModel

        _CORE_SCHEMA_INDEXES = [
            Index("ix_opt_sys_user_roles_role_user", UserRolesModel.role_id, UserRolesModel.user_id),
            Index("ix_opt_sys_role_menus_menu_role", RoleMenusModel.menu_id, RoleMenusModel.role_id),
        ]

    if include_ai and _AI_SCHEMA_INDEXES is None:
        from app.plugin.module_ai.chat.model import ChatSessionModel
        from app.plugin.module_ai.knowledge.model import KnowledgeChunkModel, KnowledgeDocumentModel
        from app.plugin.module_ai.memory.model import AiMemoryModel

        _AI_SCHEMA_INDEXES = [
            Index(
                "ix_opt_ai_document_base_status_deleted",
                KnowledgeDocumentModel.knowledge_base_id,
                KnowledgeDocumentModel.index_status,
                KnowledgeDocumentModel.is_deleted,
            ),
            Index(
                "ix_opt_ai_chunk_document_deleted_index",
                KnowledgeChunkModel.document_id,
                KnowledgeChunkModel.is_deleted,
                KnowledgeChunkModel.chunk_index,
            ),
            Index(
                "ix_opt_ai_session_user_deleted_updated",
                ChatSessionModel.user_id,
                ChatSessionModel.is_deleted,
                ChatSessionModel.updated_time,
            ),
            Index(
                "ix_opt_ai_memory_user_active_deleted_priority",
                AiMemoryModel.user_id,
                AiMemoryModel.is_active,
                AiMemoryModel.is_deleted,
                AiMemoryModel.priority,
            ),
            Index(
                "ix_opt_ai_memory_user_key_deleted",
                AiMemoryModel.user_id,
                AiMemoryModel.key,
                AiMemoryModel.is_deleted,
            ),
        ]

    return [*_CORE_SCHEMA_INDEXES, *(_AI_SCHEMA_INDEXES or [])]


async def ensure_schema_indexes() -> None:
    """Create the small set of composite indexes missing from old databases.

    ``metadata.create_all`` does not add indexes to tables that already exist,
    so startup keeps these indexes idempotent for the skeleton database and
    installations that have no committed Alembic head yet.
    """
    from app.core.plugins import is_ai_plugin_enabled

    indexes = _get_schema_indexes(is_ai_plugin_enabled())

    async with async_engine.begin() as connection:
        def create_existing_indexes(sync_connection) -> None:
            table_names = set(inspect(sync_connection).get_table_names())
            for index in indexes:
                if index.table is not None and index.table.name in table_names:
                    index.create(sync_connection, checkfirst=True)

        await connection.run_sync(create_existing_indexes)


async def drop_tables() -> None:
    """
    删除数据库表（根据 ORM metadata）。

    返回:
    - None
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(MappedBase.metadata.drop_all)


async def redis_connect(app: FastAPI, status: bool) -> Redis | None:
    """
    创建或关闭Redis连接。

    参数:
    - app (FastAPI): FastAPI应用实例。
    - status (bool): 连接状态,True为创建连接,False为关闭连接。

    返回:
    - Redis | None: Redis连接实例,如果连接失败则返回None。
    """
    if not settings.REDIS_ENABLE:
        raise CustomException(
            msg="请先开启Redis连接",
            data="请启用 app/core/config.py: REDIS_ENABLE",
        )

    if status:
        try:
            rd = await Redis.from_url(
                url=settings.REDIS_URI,
                encoding="utf-8",
                decode_responses=True,
                health_check_interval=20,
                max_connections=settings.POOL_SIZE,
                socket_timeout=settings.POOL_TIMEOUT,
            )
            app.state.redis = rd
            if await rd.ping():  # pyright: ignore[reportGeneralTypeIssues]
                return rd
        except exceptions.AuthenticationError as e:
            logger.error(f"❌ 数据库 Redis 认证失败: {e}")
            raise
        except exceptions.TimeoutError as e:
            logger.error(f"❌ 数据库 Redis 连接超时: {e}")
            raise
        except exceptions.RedisError as e:
            logger.error(f"❌ 数据库 Redis 连接错误: {e}")
            raise
    else:
        await app.state.redis.close()
        logger.info("✅️ Redis连接已关闭")
