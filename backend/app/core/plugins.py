"""插件启用状态与运行时可用性判断。"""

import importlib.util

from app.config.setting import settings


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

    try:
        return importlib.util.find_spec(f"app.plugin.{module_name}") is not None
    except (ModuleNotFoundError, ValueError):
        return False


__all__ = ["is_plugin_enabled"]
