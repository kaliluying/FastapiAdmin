import logging
import sys
from contextvars import ContextVar, Token
from typing import Any

from loguru import logger

from app.config.path_conf import LOG_DIR
from app.config.setting import settings


class RequestContext:
    """请求级别上下文管理器
    为每个请求维护独立的上下文信息（correlation_id、user_id 等），
    通过 Python contextvars 实现异步安全传递。
    典型用法:
        ctx = RequestContext()
        ctx.set_correlation_id("abc-123")
        cid = RequestContext.get_correlation_id()
    """

    _correlation_id: ContextVar[str] = ContextVar("correlation_id", default="")
    _user_id: ContextVar[int | None] = ContextVar("user_id", default=None)
    _tenant_id: ContextVar[int | None] = ContextVar("tenant_id", default=None)
    _request_path: ContextVar[str] = ContextVar("request_path", default="")

    @classmethod
    def set_correlation_id(cls, correlation_id: str) -> Token:
        return cls._correlation_id.set(correlation_id)

    @classmethod
    def get_correlation_id(cls) -> str:
        return cls._correlation_id.get()

    @classmethod
    def set_user_id(cls, user_id: int | None) -> Token:
        return cls._user_id.set(user_id)

    @classmethod
    def get_user_id(cls) -> int | None:
        return cls._user_id.get()

    @classmethod
    def set_tenant_id(cls, tenant_id: int | None) -> Token:
        return cls._tenant_id.set(tenant_id)

    @classmethod
    def get_tenant_id(cls) -> int | None:
        return cls._tenant_id.get()

    @classmethod
    def set_request_path(cls, path: str) -> Token:
        return cls._request_path.set(path)

    @classmethod
    def get_request_path(cls) -> str:
        return cls._request_path.get()

    @classmethod
    def get_extra_fields(cls) -> dict[str, Any]:
        fields: dict[str, Any] = {
            "correlation_id": cls.get_correlation_id(),
        }
        user_id = cls.get_user_id()
        if user_id is not None:
            fields["user_id"] = user_id
        tenant_id = cls.get_tenant_id()
        if tenant_id is not None:
            fields["tenant_id"] = tenant_id
        return fields


def _context_patcher(record: dict) -> None:
    """在日志格式化前，将请求上下文注入 record["extra"]。
    
    作为 logger.configure(patcher=...) 的回调，每次日志输出前被调用。
    消息可能包含 { } (如 dict repr)，因此拼接到 record["extra"] 中，
    由 loguru 静态格式串的 {extra[...]} 渲染，避开二次 format_map 解析。
    """
    cid = RequestContext.get_correlation_id()
    uid = RequestContext.get_user_id()
    parts: list[str] = []
    if cid:
        parts.append(f"cid={cid[:8]}")
    if uid is not None:
        parts.append(f"uid={uid}")
    record["extra"]["ctx"] = " | " + " ".join(parts) if parts else ""


class InterceptHandler(logging.Handler):
    """日志拦截处理器：将所有 Python 标准日志重定向到 Loguru"""

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, "{}", record.getMessage())


def setup_logger() -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    logger.remove()

    # 注入 patcher：每条日志格式化前拉取 RequestContext
    logger.configure(patcher=_context_patcher)

    # 静态格式串：loguru 用自己的模板引擎渲染，不会对消息内容做二次 format_map
    LOG_FORMAT = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
        "{extra[ctx]}"
    )
    logger.add(sys.stdout, format=LOG_FORMAT, level=settings.LOGGER_LEVEL)

    logger.add(
        str(LOG_DIR / "fastapiadmin.log"),
        format=LOG_FORMAT,
        level="INFO",
        rotation="00:00",
        retention=30,
        compression="gz",
        encoding="utf-8",
    )

    logging.basicConfig(handlers=[InterceptHandler()], level=settings.LOGGER_LEVEL, force=True)

    logger_name_list = [k for k in logging.root.manager.loggerDict if isinstance(k, str)]
    logger_name_list.extend(["uvicorn", "uvicorn.error", "uvicorn.access"])

    for logger_name in logger_name_list:
        std_logger = logging.getLogger(logger_name)
        std_logger.handlers = [InterceptHandler()]
        std_logger.propagate = False


setup_logger()
