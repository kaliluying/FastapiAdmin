"""Correlation ID 中间件

为每个 HTTP 请求注入唯一请求标识，实现全链路追踪。
"""

import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.core.context.request_context import RequestContext

# 请求头名称
CORRELATION_ID_HEADER = "X-Correlation-ID"


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """请求关联 ID 中间件

    功能：
    1. 从请求头 X-Correlation-ID 提取上游传入的关联 ID
    2. 如果不存在则自动生成 UUID4
    3. 存入 RequestContext（contextvars），异步安全
    4. 响应头中返回 X-Correlation-ID
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """处理请求并注入 correlation_id

        参数:
            request: Starlette 请求对象
            call_next: 下一个中间件/路由处理器

        返回:
            Response: 带 X-Correlation-ID 响应头的 HTTP 响应
        """
        # 1. 提取或生成 correlation_id
        correlation_id = request.headers.get(CORRELATION_ID_HEADER, "")
        if not correlation_id:
            correlation_id = str(uuid.uuid4())

        # 2. 设置到请求上下文
        token = RequestContext.set_correlation_id(correlation_id)
        RequestContext.set_request_path(request.url.path)

        try:
            # 3. 继续处理请求
            response = await call_next(request)

            # 4. 响应头中添加 correlation_id
            response.headers[CORRELATION_ID_HEADER] = correlation_id

            return response
        finally:
            # 5. 恢复上下文（防止 contextvars 泄漏到其他请求）
            RequestContext._correlation_id.reset(token)
