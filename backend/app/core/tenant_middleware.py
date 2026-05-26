"""租户上下文中间件

在请求进入业务路由前，从 Authorization Header 中解码 JWT，
提取 tenant_id 和 is_super_admin，设置到 ContextVar 中。
请求结束后自动清理 ContextVar，防止跨请求泄漏。

白名单路径（如登录、健康检查、API 文档等）不需要租户上下文，
直接放行。
"""

import json

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.config.setting import settings
from app.core.logger import log
from app.core.tenant import clear_current_tenant, set_current_tenant

# 不需要租户上下文的公开路径前缀
_DEFAULT_WHITELIST_PREFIXES: tuple[str, ...] = (
    "/docs",
    "/redoc",
    "/ljdoc",
    "/openapi.json",
    "/metrics",
    "/static",
)

# 不需要租户上下文的公开路径（精确匹配前缀）
_DEFAULT_WHITELIST_PATHS: tuple[str, ...] = (
    "/api/v1/system/auth/login",
    "/api/v1/system/auth/captcha",
    "/api/v1/system/auth/refresh",
    "/api/v1/health",
    "/api/v1/common/health",
)


def _is_whitelisted(path: str) -> bool:
    """判断请求路径是否在白名单中。

    参数:
        path: 请求路径。

    返回:
        bool: 是否命中白名单。
    """
    # 精确前缀匹配
    for whitelist_path in _DEFAULT_WHITELIST_PATHS:
        if path.startswith(whitelist_path):
            return True

    # API 文档 / 静态资源前缀匹配
    for prefix in _DEFAULT_WHITELIST_PREFIXES:
        if path.startswith(prefix):
            return True

    # 配置中的额外白名单
    for exclude_path in settings.TENANT_WHITELIST_PATHS:
        if path.startswith(exclude_path):
            return True

    return False


def _extract_tenant_from_token(request: Request) -> tuple[int | None, bool]:
    """从请求的 Authorization Header 中提取租户信息。

    参数:
        request: Starlette 请求对象。

    返回:
        tuple[int | None, bool]: (tenant_id, is_super_admin)。
        解析失败时返回 (None, False)。
    """
    authorization = request.headers.get("Authorization")
    if not authorization:
        return None, False

    # 移除 Bearer 前缀
    token = authorization
    if authorization.lower().startswith("bearer "):
        token = authorization[7:]
    elif authorization.lower().startswith("bearer"):
        token = authorization[6:]

    if not token.strip():
        return None, False

    try:
        # Lazy import to avoid circular dependency at module level
        from app.core.security import decode_access_token

        payload = decode_access_token(token)
        if not payload or not hasattr(payload, "sub"):
            return None, False

        # sub 字段中包含序列化的 OnlineOutSchema JSON
        user_info = json.loads(payload.sub)

        tenant_id = user_info.get("tenant_id")
        is_super_admin = user_info.get("is_super_admin", False)

        return tenant_id, is_super_admin

    except Exception:
        # JWT 解码失败时静默处理，不阻塞请求
        # 认证失败由 get_current_user 依赖负责
        return None, False


class TenantMiddleware(BaseHTTPMiddleware):
    """租户上下文中间件

    功能：
    1. 判断请求路径是否在白名单中，白名单路径直接放行
    2. 从 Authorization Header 中解码 JWT，提取 tenant_id 和 is_super_admin
    3. 将租户上下文写入 ContextVar
    4. 请求结束后清理 ContextVar
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint,
    ) -> Response:
        """处理请求，注入租户上下文。

        参数:
            request: Starlette 请求对象。
            call_next: 下一个中间件 / 路由处理器。

        返回:
            Response: HTTP 响应。
        """
        path = request.url.path

        # OPTIONS 预检请求直接放行
        if request.method == "OPTIONS":
            return await call_next(request)

        # 白名单路径跳过租户上下文设置
        if _is_whitelisted(path):
            return await call_next(request)

        try:
            # 从 JWT 中提取租户信息
            tenant_id, is_super_admin = _extract_tenant_from_token(request)

            # 设置租户上下文
            set_current_tenant(tenant_id, is_super_admin)

            if tenant_id is not None:
                log.debug(
                "租户上下文已设置: tenant_id={}, is_super_admin={}, path={}",
                tenant_id,
                is_super_admin,
                path,
            )

            # 继续处理请求
            response = await call_next(request)
            return response

        except Exception:
            # 中间件异常不阻塞请求，记录日志后放行
            log.exception("租户中间件处理异常: path={}", path)
            return await call_next(request)

        finally:
            # 请求结束后清理 ContextVar，防止泄漏
            clear_current_tenant()
