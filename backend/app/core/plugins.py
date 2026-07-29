"""插件启用状态与运行时可用性判断。"""

import importlib.util
from functools import lru_cache

from app.config.setting import settings
from app.core.logger import logger

_AI_EXTRA_MODULES = (
    "chromadb",
    "docx",
    "fastembed",
    "jieba",
    "langchain_anthropic",
    "langchain_core",
    "langchain_openai",
    "networkx",
    "openai",
    "pypdf",
    "whoosh",
)


@lru_cache
def _missing_ai_extra_modules() -> tuple[str, ...]:
    """Return optional AI modules missing from the current environment.

    Returns:
        Module names required by the ``ai`` optional dependency group.

    Side Effects:
        Logs one actionable warning when the configured AI plugin cannot load.
    """
    missing = tuple(module for module in _AI_EXTRA_MODULES if importlib.util.find_spec(module) is None)
    if missing:
        logger.warning("AI 插件已跳过：缺少可选依赖 {}。请执行 `uv sync --extra ai` 后再设置 AI_ENABLE=true。", ", ".join(missing))
    return missing


def is_plugin_enabled(module_name: str) -> bool:
    """判断插件是否被配置启用且对应模块仍存在。

    参数:
    - module_name: 位于 ``app.plugin`` 下的顶级模块名，例如 ``module_ai``。

    返回:
    - bool: 配置允许且模块可被发现时返回 ``True``。

    异常/副作用:
    - 模块不存在或模块规格无效时返回 ``False``，不会触发模块导入。
    """
    enable_flag = {
        "module_ai": "AI_ENABLE",
    }.get(module_name)
    if enable_flag and not getattr(settings, enable_flag, True):
        return False
    if module_name == "module_ai" and _missing_ai_extra_modules():
        return False

    try:
        return importlib.util.find_spec(f"app.plugin.{module_name}") is not None
    except (ModuleNotFoundError, ValueError):
        return False


__all__ = ["is_plugin_enabled"]
