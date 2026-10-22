import asyncio

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from app.config.path_conf import ALEMBIC_VERSION_DIR
from app.config.setting import get_settings
from app.core.base_model import MappedBase
from app.core.database import _get_schema_indexes
from app.core.modules import include_owned_schema_object
from app.scripts.initialize import InitializeData

# 确保 alembic 版本目录存在
ALEMBIC_VERSION_DIR.mkdir(parents=True, exist_ok=True)

# 导入核心模型及清单声明的已启用插件模型，供 autogenerate 使用。
loaded_models = InitializeData.get_prepare_init_models()
_get_schema_indexes()
print(f"📊 已加载 {len(loaded_models)} 个核心或已启用插件模型")

# Alembic 配置对象用于读取当前 .ini 文件中的配置值。

alembic_config = context.config

# 注册模型的 MetaData，供 autogenerate 生成迁移。

# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = MappedBase.metadata


# env.py 所需的其他配置也可通过 config.get_main_option 读取。

# my_important_option = config.get_main_option("my_important_option")

alembic_config.set_main_option("sqlalchemy.url", get_settings().ASYNC_DB_URI.replace("%", "%%"))


def run_migrations_offline() -> None:
    """以离线模式生成迁移 SQL。

    仅用 URL 配置迁移上下文，不创建数据库引擎，因此不要求 DBAPI 可用。
    此处的 ``context.execute()`` 会将传入的 SQL 写入脚本输出。
    """
    url = alembic_config.get_main_option("sqlalchemy.url")
    # 确保URL不为None
    if url is None:
        raise ValueError("数据库URL未正确配置，请检查环境配置文件")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        include_object=include_owned_schema_object,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """以在线模式执行迁移。

    创建数据库引擎，并将连接绑定到迁移上下文。
    """
    url = alembic_config.get_main_option("sqlalchemy.url")
    # 确保URL不为None
    if url is None:
        raise ValueError("数据库URL未正确配置，请检查环境配置文件")

    connectable = create_async_engine(url, poolclass=pool.NullPool)

    async def run_async_migrations() -> None:
        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)
        await connectable.dispose()

    def do_run_migrations(connection: Connection) -> None:
        def process_revision_directives(context, revision, directives) -> None:
            script = directives[0]

            # 检查所有操作集是否为空
            all_empty = all(ops.is_empty() for ops in script.upgrade_ops_list)

            if all_empty:
                # 如果没有实际变更，不生成迁移文件
                directives[:] = []
                print("❎️ 未检测到模型变更，不生成迁移文件")
            else:
                print("✅️ 检测到模型变更，生成迁移文件")

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            include_object=include_owned_schema_object,
            transaction_per_migration=True,
            process_revision_directives=process_revision_directives,
        )

        with context.begin_transaction():
            context.run_migrations()

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
