import os
from typing import Annotated

import typer
import uvicorn
from alembic.config import Config
from fastapi import FastAPI

from alembic import command
from app.common.enums import EnvironmentEnum

fastapiadmin_cli = typer.Typer()


def create_app() -> FastAPI:
    """
    创建 FastAPI 应用实例并完成日志、中间件、路由与静态资源注册。

    返回:
    - FastAPI: 已配置生命周期的应用对象。
    """
    from app.config.setting import settings
    from app.init_app import lifespan, register_exceptions, register_files, register_middlewares, register_routers, reset_api_docs
    # 创建FastAPI应用
    app = FastAPI(**settings.FASTAPI_CONFIG, lifespan=lifespan)
    # 注册异常处理器
    register_exceptions(app)
    # 注册中间件
    register_middlewares(app)
    # 注册路由
    register_routers(app)
    # 注册静态文件
    register_files(app)
    # 重设API文档
    reset_api_docs(app)
    return app


# typer.Option是非必填；typer.Argument是必填
@fastapiadmin_cli.command(
    name="run",
    help="启动 FastapiAdmin 服务, 运行 uv run main.py run --env=dev 不加参数默认 dev 环境",
)
def run(
    env: Annotated[
        EnvironmentEnum, typer.Option("--env", help="运行环境 (dev, prod)")
    ] = EnvironmentEnum.DEV,
) -> None:
    """
    按指定环境加载配置并启动 Uvicorn（开发环境开启 reload）。

    参数:
    - env (EnvironmentEnum): 运行环境，对应 `--env`。

    返回:
    - None
    """
    # 设置环境变量（必须在 import settings/logger 之前，确保加载正确环境；
    # app.core.logger 模块顶层会调用 setup_logger() 间接读取 settings，
    # 因此这里连 logger 也要延迟到环境变量设置之后才 import）
    os.environ["ENVIRONMENT"] = env.value
    from app.config.setting import settings
    from app.core.logger import logger
    from app.utils.banner import worship

    typer.secho(
        message="FastapiAdmin 服务启动",
        fg=typer.colors.GREEN,
    )
    logger.info(worship(env.value))

    # 启动uvicorn服务
    uvicorn.run(
        app="main:create_app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=env.value == EnvironmentEnum.DEV.value,
        reload_dirs=["app"] if env.value == EnvironmentEnum.DEV.value else None,
        reload_includes=["main.py"] if env.value == EnvironmentEnum.DEV.value else None,
        factory=True,
        log_config=None,
    )


@fastapiadmin_cli.command(
    name="reset",
    help="删除所有表并重建 + 写入种子数据（危险操作）, 运行 python main.py reset --env=dev",
)
def reset(
    env: Annotated[
        EnvironmentEnum, typer.Option("--env", help="运行环境 (dev, prod)")
    ] = EnvironmentEnum.DEV,
    yes: Annotated[
        bool, typer.Option("--yes", "-y", help="跳过确认，直接执行")
    ] = False,
) -> None:
    """
    删除全部 ORM 表并重建结构，然后写入基础种子数据。

    单进程内导入 initialize（注册全部模型到 metadata），依次执行
    drop_all → create_all → 种子导入，避免分步执行时元数据不完整。

    参数:
    - env (EnvironmentEnum): 运行环境，对应 `--env`。
    - yes (bool): 跳过交互式确认，对应 `--yes/-y`。

    返回:
    - None
    """
    os.environ["ENVIRONMENT"] = env.value
    from app.config.setting import get_settings

    get_settings.cache_clear()

    if not yes:
        confirm = typer.confirm(
            f"⚠️  将删除 {env.value} 环境数据库的所有表并重建，数据不可恢复，确认继续？"
        )
        if not confirm:
            typer.echo("已取消")
            raise typer.Exit(code=1)

    import asyncio

    from sqlalchemy import MetaData, inspect
    from sqlalchemy.exc import CompileError
    from sqlalchemy.schema import DropConstraint, DropTable

    # 导入 initialize 会注册全部模型到 metadata（create_all 依赖完整元数据）
    from app.core.database import async_engine, create_tables
    from app.scripts.initialize import InitializeData

    async def _reset() -> None:
        """通过当前数据库方言反射并删除全部表，再重建 ORM 表结构。"""

        def drop_reflected_tables(connection) -> None:
            """Drop reflected tables and foreign keys without vendor SQL.

            参数:
            - connection: SQLAlchemy 同步连接，由异步连接的 ``run_sync`` 提供。

            返回:
            - None

            说明:
            - 先删除可反射的外键约束，再按逆依赖顺序删表，避免依赖
              MySQL ``information_schema`` 或 ``FOREIGN_KEY_CHECKS``。
            """
            inspector = inspect(connection)
            table_names = inspector.get_table_names()
            if not table_names:
                return

            metadata = MetaData()
            metadata.reflect(bind=connection, only=table_names)
            for table in metadata.tables.values():
                for constraint in table.foreign_key_constraints:
                    try:
                        connection.execute(DropConstraint(constraint))
                    except (CompileError, NotImplementedError):
                        # SQLite 不支持独立删除外键约束，后续删表即可清理。
                        continue

            for table in reversed(list(metadata.tables.values())):
                connection.execute(DropTable(table, if_exists=True))

        async with async_engine.begin() as conn:
            await conn.run_sync(drop_reflected_tables)
        # reset 不能依赖开发环境的自动建表开关，清表后必须显式恢复完整模型结构。
        await create_tables()
        await InitializeData().init_db()

    asyncio.run(_reset())
    typer.secho(
        message="数据库已重置并写入种子数据",
        fg=typer.colors.GREEN,
    )


@fastapiadmin_cli.command(
    name="revision",
    help="生成新的 Alembic 迁移脚本, 运行 python main.py revision --env=dev",
)
def revision(
    env: Annotated[
        EnvironmentEnum, typer.Option("--env", help="运行环境 (dev, prod)")
    ] = EnvironmentEnum.DEV,
) -> None:
    """
    使用 Alembic 自动生成迁移脚本（autogenerate）。

    参数:
    - env (EnvironmentEnum): 运行环境，用于加载对应数据库模型元数据。

    返回:
    - None
    """
    os.environ["ENVIRONMENT"] = env.value
    from app.config.setting import get_settings

    get_settings.cache_clear()
    alembic_cfg = Config("alembic.ini")
    command.revision(alembic_cfg, autogenerate=True, message="迁移脚本")
    typer.echo("迁移脚本已生成")


@fastapiadmin_cli.command(
    name="upgrade",
    help="应用最新的 Alembic 迁移, 运行 python main.py upgrade --env=dev",
)
def upgrade(
    env: Annotated[
        EnvironmentEnum, typer.Option("--env", help="运行环境 (dev, prod)")
    ] = EnvironmentEnum.DEV,
) -> None:
    """
    将数据库升级到 Alembic 最新版本（head）。

    参数:
    - env (EnvironmentEnum): 运行环境。

    返回:
    - None
    """
    os.environ["ENVIRONMENT"] = env.value
    from app.config.setting import get_settings

    get_settings.cache_clear()
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    typer.echo("所有迁移已应用。")


if __name__ == "__main__":
    fastapiadmin_cli()
