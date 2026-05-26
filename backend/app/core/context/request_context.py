"""请求上下文管理

为每个请求维护独立的上下文信息（correlation_id、user_id 等），
通过 Python contextvars 实现异步安全传递。
"""

from contextvars import ContextVar, Token
from typing import Any


class RequestContext:
    """请求级别上下文管理器

    使用 contextvars 确保在异步环境中每个请求的上下文独立。
    典型用法:
        ctx = RequestContext()
        ctx.set_correlation_id("abc-123")
        # 在请求的任何位置（包括异步子协程）都能获取到
        cid = RequestContext.get_correlation_id()
    """

    _correlation_id: ContextVar[str] = ContextVar("correlation_id", default="")
    _user_id: ContextVar[int | None] = ContextVar("user_id", default=None)
    _tenant_id: ContextVar[int | None] = ContextVar("tenant_id", default=None)
    _request_path: ContextVar[str] = ContextVar("request_path", default="")

    @classmethod
    def set_correlation_id(cls, correlation_id: str) -> Token:
        """设置请求关联 ID

        参数:
            correlation_id: 唯一请求标识，通常从 X-Correlation-ID 请求头获取

        返回:
            Token: contextvars Token，可用于恢复旧值
        """
        return cls._correlation_id.set(correlation_id)

    @classmethod
    def get_correlation_id(cls) -> str:
        """获取当前请求的关联 ID

        如果没有设置则返回空字符串。

        返回:
            str: 请求关联 ID
        """
        return cls._correlation_id.get()

    @classmethod
    def set_user_id(cls, user_id: int | None) -> Token:
        """设置当前请求的用户 ID

        参数:
            user_id: 用户 ID，None 表示未认证

        返回:
            Token: contextvars Token
        """
        return cls._user_id.set(user_id)

    @classmethod
    def get_user_id(cls) -> int | None:
        """获取当前请求的用户 ID

        返回:
            Optional[int]: 用户 ID，未认证时返回 None
        """
        return cls._user_id.get()

    @classmethod
    def set_tenant_id(cls, tenant_id: int | None) -> Token:
        """设置当前请求的租户 ID

        参数:
            tenant_id: 租户 ID

        返回:
            Token: contextvars Token
        """
        return cls._tenant_id.set(tenant_id)

    @classmethod
    def get_tenant_id(cls) -> int | None:
        """获取当前请求的租户 ID

        返回:
            Optional[int]: 租户 ID
        """
        return cls._tenant_id.get()

    @classmethod
    def set_request_path(cls, path: str) -> Token:
        """设置当前请求路径

        参数:
            path: 请求路径

        返回:
            Token: contextvars Token
        """
        return cls._request_path.set(path)

    @classmethod
    def get_request_path(cls) -> str:
        """获取当前请求路径

        返回:
            str: 请求路径
        """
        return cls._request_path.get()

    @classmethod
    def get_extra_fields(cls) -> dict[str, Any]:
        """获取日志附加字段

        将所有上下文信息组装为字典，用于日志输出。

        返回:
            dict: 包含 correlation_id、user_id、tenant_id 的字典
        """
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
