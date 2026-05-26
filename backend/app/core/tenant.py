"""多租户上下文管理

使用 Python contextvars 实现异步安全的租户上下文传递。
在整个请求生命周期中，通过 ContextVar 存储当前请求的租户 ID
和超级管理员标识，供 ORM 事件处理器、依赖注入等模块使用。
"""

from __future__ import annotations

from contextvars import ContextVar

# 当前请求的租户 ID（None 表示未设置或公开接口）
current_tenant_id: ContextVar[int | None] = ContextVar(
    "current_tenant_id", default=None
)

# 当前用户是否为超级管理员
current_is_super_admin: ContextVar[bool] = ContextVar(
    "current_is_super_admin", default=False
)


def set_current_tenant(tenant_id: int | None, is_super_admin: bool = False) -> None:
    """设置当前请求的租户上下文。

    参数:
        tenant_id: 租户 ID，None 表示无租户上下文（公开接口或未认证）。
        is_super_admin: 是否为平台超级管理员，默认 False。
    """
    current_tenant_id.set(tenant_id)
    current_is_super_admin.set(is_super_admin)


def get_current_tenant_id() -> int | None:
    """获取当前请求的租户 ID。

    返回:
        int | None: 租户 ID，未设置时返回 None。
    """
    return current_tenant_id.get()


def get_is_super_admin() -> bool:
    """获取当前用户是否为超级管理员。

    返回:
        bool: 是否为超级管理员，默认 False。
    """
    return current_is_super_admin.get()


def clear_current_tenant() -> None:
    """清除当前请求的租户上下文（重置为默认值）。

    应在请求结束时调用，防止 ContextVar 泄漏到其他请求。
    """
    current_tenant_id.set(None)
    current_is_super_admin.set(False)
