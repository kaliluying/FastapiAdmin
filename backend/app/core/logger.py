import atexit
import logging
import sys

from loguru import logger
from typing_extensions import override

from app.config.path_conf import LOG_DIR
from app.config.setting import settings

# 全局变量记录日志处理器ID
_logger_handlers = []


def _format_with_context(record: dict) -> str:
    """自定义日志格式化函数，自动注入请求上下文信息

    在日志消息尾部追加 correlation_id、user_id 等上下文字段，
    实现全链路追踪的可观测性。

    参数:
        record: loguru 日志记录字典

    返回:
        str: 格式化后的日志字符串
    """
    # 延迟导入避免循环依赖
    from app.core.context.request_context import RequestContext

    # 基础格式（控制台彩色版本）
    base = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )

    # 尝试获取请求上下文
    cid = RequestContext.get_correlation_id()
    uid = RequestContext.get_user_id()

    extras: list[str] = []
    if cid:
        extras.append(f"cid={cid[:8]}")
    if uid is not None:
        extras.append(f"uid={uid}")

    if extras:
        return base + " | <dim>" + " ".join(extras) + "</dim>\n"
    return base + "\n"


def _format_file_with_context(record: dict) -> str:
    """文件日志格式化函数（去除颜色标签，适合日志文件存储）

    参数:
        record: loguru 日志记录字典

    返回:
        str: 纯文本格式化日志字符串
    """
    from app.core.context.request_context import RequestContext

    base = (
        "{time:YYYY-MM-DD HH:mm:ss.SSS} | "
        "{level: <8} | "
        "{name}:{function}:{line} - "
        "{message}"
    )

    cid = RequestContext.get_correlation_id()
    uid = RequestContext.get_user_id()

    extras: list[str] = []
    if cid:
        extras.append(f"cid={cid[:8]}")
    if uid is not None:
        extras.append(f"uid={uid}")

    if extras:
        return base + " | " + " ".join(extras) + "\n"
    return base + "\n"


class InterceptHandler(logging.Handler):
    """
    日志拦截处理器：将所有 Python 标准日志重定向到 Loguru

    工作原理：
    1. 继承自 logging.Handler
    2. 重写 emit 方法处理日志记录
    3. 将标准库日志转换为 Loguru 格式
    """

    @override
    def emit(self, record: logging.LogRecord) -> None:
        """
        将标准库 LogRecord 转发到 Loguru。

        参数:
        - record (logging.LogRecord): 标准库日志记录。

        返回:
        - None
        """
        # 尝试获取日志级别名称
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # 获取调用帧信息，增加None检查
        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        # 使用 Loguru 记录日志
        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def cleanup_logging() -> None:
    """
    清理日志资源；在程序退出时调用，移除已注册的 Loguru 处理器。

    返回:
    - None
    """
    global _logger_handlers

    for handler_id in _logger_handlers:
        try:
            logger.remove(handler_id)
        except ValueError:
            # 处理器已不存在，忽略
            pass

    _logger_handlers.clear()


def setup_logging() -> None:
    """
    配置日志系统：控制台彩色输出、文件轮转、错误日志分文件。

    返回:
    - None
    """
    global _logger_handlers

    # 添加上下文信息
    _ = logger.configure(extra={"app_name": "FastapiAdmin"})
    # 步骤1：移除默认处理器
    logger.remove()

    # 步骤2：使用自定义格式化函数（自动注入 correlation_id）
    log_format = _format_with_context

    # 步骤3：配置控制台输出
    handler_id = logger.add(sys.stdout, format=log_format, level=settings.LOGGER_LEVEL)
    _logger_handlers.append(handler_id)

    # 步骤4：创建日志目录
    log_dir = LOG_DIR
    # 确保日志目录存在,如果不存在则创建
    log_dir.mkdir(parents=True, exist_ok=True)

    # 步骤5：配置常规日志文件（去除颜色标签）
    file_format = _format_file_with_context
    handler_id = logger.add(
        str(log_dir / "info.log"),
        format=file_format,
        level="INFO",
        rotation="00:00",  # 每天午夜轮转
        retention=30,  # 日志保留天数，超过此天数的日志文件将被自动清理
        compression="gz",
        encoding="utf-8",
    )
    _logger_handlers.append(handler_id)

    # 步骤6：配置错误日志文件（去除颜色标签）
    handler_id = logger.add(
        str(log_dir / "error.log"),
        format=file_format,
        level="ERROR",
        rotation="00:00",  # 每天午夜轮转
        retention=30,  # 日志保留天数，超过此天数的日志文件将被自动清理
        compression="gz",
        encoding="utf-8",
        backtrace=True,
        diagnose=True,
    )
    _logger_handlers.append(handler_id)

    # 步骤7：配置标准库日志
    logging.basicConfig(handlers=[InterceptHandler()], level=settings.LOGGER_LEVEL, force=True)
    logger_name_list = list(logging.root.manager.loggerDict)

    # 步骤8：配置第三方库日志
    for logger_name in logger_name_list:
        logger_ = logging.getLogger(logger_name)
        logger_.handlers = [InterceptHandler()]
        logger_.propagate = False

    # 注册退出清理函数
    atexit.register(cleanup_logging)


log = logger
