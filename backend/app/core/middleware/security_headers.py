"""安全响应头中间件

自动为每个 HTTP 响应注入安全相关响应头，防护常见 Web 攻击。
"""

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """安全响应头中间件

    注入以下安全响应头：
    - Strict-Transport-Security (HSTS): 强制 HTTPS 连接（根据配置开关）
    - X-Content-Type-Options: 禁止 MIME 类型嗅探
    - X-Frame-Options: 禁止页面被嵌入 iframe（防点击劫持）
    - X-XSS-Protection: 启用浏览器 XSS 过滤器
    - Referrer-Policy: 控制 Referer 信息传递
    - Permissions-Policy: 限制浏览器 API 使用
    - Content-Security-Policy: 内容安全策略
    """

    def __init__(self, app: ASGIApp) -> None:
        """初始化安全响应头中间件

        HSTS 开关从 settings.HSTS_ENABLE 读取。

        参数:
            app: ASGI 应用实例
        """
        super().__init__(app)
        from app.config.setting import settings

        self._hsts = settings.HSTS_ENABLE

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """处理请求并注入安全响应头

        参数:
            request: Starlette 请求对象
            call_next: 下一个中间件/路由处理器

        返回:
            Response: 带安全响应头的 HTTP 响应
        """
        response = await call_next(request)

        # HSTS（仅生产环境启用）
        if self._hsts:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        # 禁止 MIME 类型嗅探
        response.headers["X-Content-Type-Options"] = "nosniff"

        # 禁止嵌入 iframe（防止点击劫持）
        response.headers["X-Frame-Options"] = "DENY"

        # 启用浏览器 XSS 过滤器
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # 控制 Referer 信息
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # 限制浏览器 API 权限
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), "
            "payment=(), usb=(), magnetometer=(), "
            "gyroscope=(), speaker=(), vibrate=()"
        )

        # 内容安全策略（基础级别，可按需收紧）
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none'"
        )

        return response
