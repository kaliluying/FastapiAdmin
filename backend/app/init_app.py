import asyncio
import sys
from collections.abc import AsyncGenerator
from contextlib import suppress
from typing import Any
from uuid import uuid4

from fastapi import Depends, FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html, get_swagger_ui_oauth2_redirect_html
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter, WebSocketRateLimiter

from app.core import cache_util

from .common.enums import EnvironmentEnum
from .config.path_conf import BASE_DIR
from .config.setting import settings
from .core.exceptions import handle_exception
from .core.http_limit import http_limit_callback, ws_limit_callback
from .core.logger import logger
from .core.plugins import get_ai_routers, get_ai_websocket_routers, initialize_ai_plugin
from .core.redis_crud import RedisCURD
from .scripts.migrate import upgrade_database
from .scripts.startup_policy import validate_database_schema
from .utils.common_util import import_module, import_modules_async
from .utils.console import console_end, console_start


async def run_startup_migration() -> bool:
    """Apply all committed Alembic migrations before database initialization.

    Returns:
        bool: Whether a migration head was found and applied or checked.

    Side effects:
        Runs Alembic ``upgrade head`` in a worker thread and may modify the
        configured database schema.
    """
    logger.info("⏳ 开始应用数据库迁移")
    applied = await asyncio.to_thread(upgrade_database)
    if applied:
        logger.info("✅ 数据库迁移应用完成")
    else:
        logger.info("ℹ️ 当前没有迁移文件，跳过 Alembic")
    return applied


@asynccontextmanager
async def _startup_schema_lock(redis) -> AsyncGenerator[None, None]:
    """Serialize schema and seed work when several workers start together."""
    lock_key = "fastapiadmin:startup:schema"
    lock_value = uuid4().hex
    redis_crud = RedisCURD(redis)
    deadline = asyncio.get_running_loop().time() + 120
    acquired = False
    while not acquired:
        acquired, _ = await redis_crud.lock(lock_key, expire=300, value=lock_value)
        if acquired:
            break
        if asyncio.get_running_loop().time() >= deadline:
            raise TimeoutError("等待数据库启动锁超时")
        await asyncio.sleep(1)

    owner_task = asyncio.current_task()
    lease_lost = False

    async def renew() -> None:
        nonlocal lease_lost
        while True:
            await asyncio.sleep(30)
            if not await redis_crud.renew_lock(lock_key, expire=300, value=lock_value):
                lease_lost = True
                if owner_task is not None:
                    owner_task.cancel()
                return

    renewal_task = asyncio.create_task(renew())
    try:
        yield
        if lease_lost:
            raise RuntimeError("数据库启动锁已失效，初始化已中止")
    except asyncio.CancelledError:
        if lease_lost:
            raise RuntimeError("数据库启动锁已失效，初始化已中止") from None
        raise
    finally:
        renewal_task.cancel()
        with suppress(asyncio.CancelledError):
            await renewal_task
        await redis_crud.unlock(lock_key, lock_value)


async def bootstrap_database(redis, environment: EnvironmentEnum | None = None) -> None:
    """Run schema and seed initialization in a cancellable, lease-protected process."""
    async with _startup_schema_lock(redis):
        process = await asyncio.create_subprocess_exec(
            sys.executable,
            "-m",
            "app.scripts.startup_policy",
            "--env",
            (environment or settings.ENVIRONMENT).value,
            cwd=BASE_DIR,
        )
        try:
            return_code = await process.wait()
        except BaseException:
            if process.returncode is None:
                with suppress(ProcessLookupError):
                    process.terminate()
                try:
                    await asyncio.wait_for(process.wait(), timeout=5)
                except TimeoutError:
                    with suppress(ProcessLookupError):
                        process.kill()
                    await process.wait()
            raise
        if return_code != 0:
            raise RuntimeError(f"数据库初始化失败，退出码 {return_code}")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[Any, Any]:
    from app.plugin.module_ai.knowledge.recovery import stop_knowledge_recovery

    try:
        if not settings.REDIS_ENABLE:
            raise RuntimeError("Redis 是会话、请求限流和任务协调的必需依赖，REDIS_ENABLE 必须为 true")
        await import_modules_async(modules=settings.EVENT_LIST, desc="全局事件", app=app, status=True)
        logger.info("✅ 全局事件模块加载完成")
        if settings.ENVIRONMENT == EnvironmentEnum.DEV:
            await bootstrap_database(app.state.redis)
        else:
            await validate_database_schema()
        logger.info("✅ {}数据库结构就绪", settings.DATABASE_TYPE)
        await initialize_ai_plugin()
        await cache_util.init(redis=app.state.redis)
        logger.info("✅ fastapi-admin-cache 初始化完成")
        await FastAPILimiter.init(
            redis=app.state.redis,
            prefix=settings.REQUEST_LIMITER_REDIS_PREFIX,
            http_callback=http_limit_callback,
            ws_callback=ws_limit_callback,
        )
        logger.info("✅ 请求限流器初始化完成")
    except BaseException as e:
        await stop_knowledge_recovery()
        if not isinstance(e, Exception):
            raise
        logger.error("❌ 应用初始化失败: {}", e)
        raise SystemExit(1)

    try:
        console_start(
            host=settings.SERVER_HOST,
            port=settings.SERVER_PORT,
            reload=settings.ENVIRONMENT,
            database_ready=True,
            redis_ready=True,
            limiter_ready=True,
        )
    except Exception:
        pass

    try:
        yield
    finally:
        try:
            await stop_knowledge_recovery()
            await cache_util.clear()
            logger.info("✅ fastapi-admin-cache 已关闭")
            await FastAPILimiter.close()
            logger.info("✅ 请求限制器已关闭")
            await import_modules_async(modules=settings.EVENT_LIST, desc="全局事件", app=app, status=False)
            logger.info("✅ 全局事件模块卸载完成")
            from app.core.database import async_engine

            await async_engine.dispose()
            logger.info("✅ 数据库引擎连接池已释放")
        except Exception as e:
            logger.error("❌ 应用关闭过程中发生错误: {}", e)
            raise SystemExit(1)

        try:
            console_end()
        except Exception:
            pass


def register_middlewares(app: FastAPI) -> None:
    for middleware in settings.MIDDLEWARE_LIST[::-1]:
        if not middleware:
            continue
        middleware = import_module(middleware, desc="中间件")
        app.add_middleware(middleware)


def register_exceptions(app: FastAPI) -> None:
    handle_exception(app)


def register_routers(app: FastAPI) -> None:
    from app.api.v1.module_common import common_router
    from app.api.v1.module_platform import platform_router
    from app.api.v1.module_system import system_router

    times, seconds = settings.RATE_LIMITER_TIMES, settings.RATE_LIMITER_SECONDS
    if times <= 0 or seconds <= 0:
        raise ValueError("RATE_LIMITER_TIMES 和 RATE_LIMITER_SECONDS 必须为正整数")
    app.include_router(common_router, dependencies=[Depends(RateLimiter(times=times, seconds=seconds))])
    app.include_router(platform_router, dependencies=[Depends(RateLimiter(times=times, seconds=seconds))])
    app.include_router(system_router, dependencies=[Depends(RateLimiter(times=times, seconds=seconds))])
    if settings.ENVIRONMENT == EnvironmentEnum.DEV:
        from app.api.v1.module_demo import demo_router

        app.include_router(demo_router, dependencies=[Depends(RateLimiter(times=times, seconds=seconds))])

    for router in get_ai_websocket_routers():
        app.include_router(router=router, dependencies=[Depends(WebSocketRateLimiter(times=times, seconds=seconds))])

    for router in get_ai_routers():
        app.include_router(router=router, dependencies=[Depends(RateLimiter(times=times, seconds=seconds))])


def register_files(app: FastAPI) -> None:
    if settings.STATIC_ENABLE:
        settings.STATIC_ROOT.mkdir(parents=True, exist_ok=True)
        app.mount(path=settings.STATIC_URL, app=StaticFiles(directory=settings.STATIC_ROOT), name=settings.STATIC_DIR)


def reset_api_docs(app: FastAPI) -> None:
    swagger_ui_redirect_url = str(app.swagger_ui_oauth2_redirect_url)
    root_openapi_url = str(app.root_path) + str(app.openapi_url)

    @app.get(swagger_ui_redirect_url, include_in_schema=False)
    async def swagger_ui_redirect():
        return get_swagger_ui_oauth2_redirect_html()

    @app.get(settings.DOCS_URL, include_in_schema=False)
    async def custom_swagger_ui_html() -> HTMLResponse:
        return get_swagger_ui_html(
            openapi_url=root_openapi_url,
            title=app.title + " - Swagger UI",
            oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
            swagger_js_url=settings.SWAGGER_JS_URL,
            swagger_css_url=settings.SWAGGER_CSS_URL,
            swagger_favicon_url=settings.FAVICON_URL,
        )

    @app.get(settings.REDOC_URL, include_in_schema=False)
    async def custom_redoc_html():
        return get_redoc_html(
            openapi_url=root_openapi_url,
            title=app.title + " - ReDoc",
            redoc_js_url=settings.REDOC_JS_URL,
            redoc_favicon_url=settings.FAVICON_URL,
        )
