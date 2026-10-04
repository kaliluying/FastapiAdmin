"""Explicit database bootstrap and read-only production startup checks."""

import argparse
import asyncio
import os

from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory
from sqlalchemy import inspect


async def validate_database_schema() -> None:
    """Reject missing migrations, tables, columns and required indexes without repairing them."""
    from app.config.path_conf import BASE_DIR
    from app.core.base_model import MappedBase
    from app.core.database import _get_schema_indexes, async_engine
    from app.scripts.initialize import InitializeData

    InitializeData.get_prepare_init_models()
    required_indexes = _get_schema_indexes()
    config = Config(str(BASE_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BASE_DIR / "app" / "alembic"))
    expected_heads = set(ScriptDirectory.from_config(config).get_heads())

    def check_schema(connection) -> None:
        inspector = inspect(connection)
        if set(MigrationContext.configure(connection).get_current_heads()) != expected_heads:
            raise RuntimeError("数据库迁移版本不匹配，请在部署阶段运行 python main.py upgrade --env=prod")
        tables = set(inspector.get_table_names())
        missing_tables = set(MappedBase.metadata.tables) - tables
        if missing_tables:
            raise RuntimeError(f"数据库缺少表 {', '.join(sorted(missing_tables))}；首次部署请运行 python main.py bootstrap --env=prod")
        for table in MappedBase.metadata.sorted_tables:
            columns = {column["name"] for column in inspector.get_columns(table.name)}
            missing_columns = set(table.columns.keys()) - columns
            if missing_columns:
                raise RuntimeError(f"数据库表 {table.name} 缺少列 {', '.join(sorted(missing_columns))}；请检查部署迁移")
            indexes = {index["name"] for index in inspector.get_indexes(table.name)}
            missing_indexes = {index.name for index in required_indexes if index.table is table} - indexes
            if missing_indexes:
                raise RuntimeError(f"数据库表 {table.name} 缺少索引 {', '.join(sorted(missing_indexes))}；请检查部署迁移")

    async with async_engine.connect() as connection:
        await connection.run_sync(check_schema)


async def _bootstrap() -> None:
    """Reuse transactional stable-key seeds; Alembic owns schema checkpoints."""
    from app.core.database import async_engine
    from app.init_app import run_startup_migration
    from app.scripts.initialize import InitializeData

    try:
        await run_startup_migration()
        await InitializeData().init_db()
        await validate_database_schema()
    finally:
        await async_engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="内部数据库初始化 worker；部署请使用 main.py bootstrap")
    parser.add_argument("--env", choices=("dev", "prod"), required=True)
    arguments = parser.parse_args()
    os.environ["ENVIRONMENT"] = arguments.env
    asyncio.run(_bootstrap())
