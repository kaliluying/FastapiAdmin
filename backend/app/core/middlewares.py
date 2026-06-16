import json
import time
import uuid

from starlette.middleware.base import (
    BaseHTTPMiddleware,
    RequestResponseEndpoint,
)
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.api.v1.module_system.params.service import ParamsService
from app.common.response import ErrorResponse
from app.config.setting import settings
from app.core.exceptions import CustomException
from app.core.logger import RequestContext, logger
from app.core.security import decode_access_token
from app.core.tenant import clear_current_tenant, set_current_tenant


class CustomCORSMiddleware(CORSMiddleware):
    """CORS跨域中间件"""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(
            app,
            allow_origins=settings.ALLOW_ORIGINS,
            allow_methods=settings.ALLOW_METHODS,
            allow_headers=settings.ALLOW_HEADERS,
            allow_credentials=settings.ALLOW_CREDENTIALS,
            expose_headers=settings.CORS_EXPOSE_HEADERS,
        )


class RequestLogMiddleware(BaseHTTPMiddleware):
    """
    记录请求日志中间件: 提供一个基础的中间件类，允许你自定义请求和响应处理逻辑。
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    @staticmethod
    def _extract_session_id_from_request(request: Request) -> str | None:
        """
        从请求中提取session_id（支持从Token或已设置的scope中获取）

        参数:
        - request (Request): 请求对象

        返回:
        - str | None: 会话ID，如果无法提取则返回None
        """
        # 1. 先检查 scope 中是否已经有 session_id（登录接口会设置）
        session_id = request.scope.get("session_id")
        if session_id:
            return session_id

        # 2. 检查 TenantMiddleware 缓存到 scope 的 JWT user_info（避免重复解码）
        user_info = request.scope.get("_jwt_user_info")
        if user_info:
            session_id = user_info.get("session_id")
            if session_id:
                request.scope["session_id"] = session_id
                return session_id

        # 3. 尝试从 Authorization Header 中提取
        try:
            authorization = request.headers.get("Authorization")
            if not authorization:
                return None

            # 处理Bearer token (大小写不敏感)
            token = authorization
            if authorization.lower().startswith("bearer "):
                token = authorization[7:].strip()
            elif authorization.lower().startswith("bearer"):
                token = authorization[6:].strip()

            # 解码token
            payload = decode_access_token(token)
            if not payload or not hasattr(payload, "sub"):
                return None

            # 从payload中提取session_id
            user_info = json.loads(payload.sub)
            session_id = user_info.get("session_id")

            # 同时设置到request.scope中，避免后续重复解析
            if session_id:
                request.scope["session_id"] = session_id

            return session_id
        except Exception:
            # 解析失败静默处理，返回None（可能是未认证请求）
            return None

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """
        记录请求日志并透传响应。

        参数:
        - request (Request): 当前请求。
        - call_next (RequestResponseEndpoint): 下一层 ASGI 可调用对象。

        返回:
        - Response: 下游中间件/路由产生的响应。
        """
        start_time = time.time()

        # 尝试提取session_id
        session_id = self._extract_session_id_from_request(request)

        # 组装请求日志字段
        log_fields = (
            f"请求来源: {request.client.host if request.client else '未知'},"
            f"请求方法: {request.method},"
            f"请求路径: {request.url.path}"
        )
        logger.info(log_fields)

        try:
            # 初始化响应变量
            response = None

            # 获取请求路径
            path = request.scope.get("path")

            # 尝试获取客户端真实IP
            request_ip = None
            request_ip = (
                x_forwarded_for.split(",")[0].strip()
                if (x_forwarded_for := request.headers.get("X-Forwarded-For"))
                else request.client.host
                if request.client
                else None
            )
            # 检查是否启用演示模式
            demo_enable = False
            ip_white_list = []
            white_api_list_path = []
            ip_black_list = []

            try:
                # 从应用实例获取Redis连接
                redis = request.app.state.redis
                if not redis:
                    raise CustomException(msg="无法获取Redis连接")

                # 使用ParamsService获取系统配置
                system_config = await ParamsService.get_system_config_for_middleware(redis)
                # 提取配置值
                demo_enable = system_config["demo_enable"]
                ip_white_list = system_config["ip_white_list"]
                white_api_list_path = system_config["white_api_list_path"]
                ip_black_list = system_config["ip_black_list"]

            except Exception as e:
                logger.error(f"获取系统配置失败: {e}")

            # 检查是否需要拦截请求
            should_block = False
            block_reason = ""

            # 1. 首先检查IP是否在黑名单中
            if request_ip and request_ip in ip_black_list:
                should_block = True
                block_reason = f"IP地址 {request_ip} 在黑名单中"

            # 2. 如果不在黑名单中，检查是否在演示模式下需要拦截
            elif demo_enable in (True, "true", "True") and request.method != "GET":
                # 在演示模式下，非GET请求需要检查白名单
                is_ip_whitelisted = request_ip in ip_white_list
                is_path_whitelisted = path in white_api_list_path

                if not is_ip_whitelisted and not is_path_whitelisted:
                    should_block = True
                    block_reason = f"演示模式下拦截非GET请求，IP: {request_ip}, 路径: {path}"

            if should_block:
                # 增强安全审计：记录详细的拦截日志
                logger.warning(
                    " | ".join([
                        f"会话ID: {session_id or '未认证'}",
                        f"请求被拦截: {block_reason}",
                        f"请求来源: {request_ip}",
                        f"请求方法: {request.method}",
                        f"请求路径: {path}",
                        f"用户代理: {request.headers.get('user-agent', '未知')}",
                        f"演示模式: {demo_enable}",
                    ])
                )
                # 拦截请求
                return ErrorResponse(msg="演示环境，禁止操作")
            # 正常处理请求
            response = await call_next(request)

            # 计算处理时间并添加到响应头
            process_time = round(time.time() - start_time, 5)
            response.headers["X-Process-Time"] = str(process_time)

            # 构建响应日志信息
            response_info = f"响应状态: {response.status_code}, 处理时间: {round(process_time * 1000, 3)}ms"
            logger.info(response_info)

            return response

        except CustomException as e:
            logger.exception(f"中间件处理异常: {e!s}")
            return ErrorResponse(msg="系统异常，请联系管理员", data=str(e))


class CustomGZipMiddleware(GZipMiddleware):
    """GZip压缩中间件"""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(
            app,
            minimum_size=settings.GZIP_MIN_SIZE,
            compresslevel=settings.GZIP_COMPRESS_LEVEL,
        )


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """安全响应头中间件"""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)
        from app.config.setting import settings

        self._hsts = settings.HSTS_ENABLE

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        if self._hsts:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), "
            "payment=(), usb=(), magnetometer=(), "
            "gyroscope=()"
        )

        return response


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """请求关联 ID 中间件"""
    
    def __init__(self, app: ASGIApp) -> None:
        self.CORRELATION_ID_HEADER = "X-Correlation-ID"
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        correlation_id = request.headers.get(self.CORRELATION_ID_HEADER, "")
        if not correlation_id:
            correlation_id = str(uuid.uuid4())

        token = RequestContext.set_correlation_id(correlation_id)
        RequestContext.set_request_path(request.url.path)

        try:
            response = await call_next(request)
            response.headers[self.CORRELATION_ID_HEADER] = correlation_id
            return response
        finally:
            RequestContext._correlation_id.reset(token)


# ── 租户白名单 ──

_TENANT_WHITELIST_PREFIXES: tuple[str, ...] = (
    "/docs", "/redoc", "/ljdoc", "/openapi.json", "/metrics", "/static",
)

_TENANT_WHITELIST_PATHS: tuple[str, ...] = (
    "/api/v1/system/auth/login",
    "/api/v1/system/auth/captcha",
    "/api/v1/system/auth/refresh",
    "/api/v1/health",
    "/api/v1/common/health",
)


def _tenant_is_whitelisted(path: str) -> bool:
    for wp in _TENANT_WHITELIST_PATHS:
        if path.startswith(wp):
            return True
    for prefix in _TENANT_WHITELIST_PREFIXES:
        if path.startswith(prefix):
            return True
    for exclude_path in settings.TENANT_WHITELIST_PATHS:
        if path.startswith(exclude_path):
            return True
    return False


def _extract_tenant_from_token(request: Request) -> tuple[int | None, bool]:
    authorization = request.headers.get("Authorization")
    if not authorization:
        return None, False
    token = authorization
    if authorization.lower().startswith("bearer "):
        token = authorization[7:]
    elif authorization.lower().startswith("bearer"):
        token = authorization[6:]
    if not token.strip():
        return None, False
    try:
        payload = decode_access_token(token)
        if not payload or not hasattr(payload, "sub"):
            return None, False
        user_info = json.loads(payload.sub)
        # 缓存到 request.scope，避免后续中间件/依赖重复解码 JWT
        request.scope["_jwt_payload"] = payload
        request.scope["_jwt_user_info"] = user_info
        tenant_id = user_info.get("tenant_id")
        is_super_admin = user_info.get("is_super_admin", False)
        return tenant_id, is_super_admin
    except Exception:
        return None, False


class TenantMiddleware(BaseHTTPMiddleware):
    """租户上下文中间件"""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path

        if request.method == "OPTIONS":
            return await call_next(request)

        if _tenant_is_whitelisted(path):
            return await call_next(request)

        try:
            tenant_id, is_super_admin = _extract_tenant_from_token(request)
            set_current_tenant(tenant_id, is_super_admin)
            if tenant_id is not None:
                logger.debug(
                    "租户上下文已设置: tenant_id={}, is_super_admin={}, path={}",
                    tenant_id, is_super_admin, path,
                )
        except Exception:
            logger.exception("租户中间件处理异常: path={}", path)
        try:
            response = await call_next(request)
            return response
        finally:
            clear_current_tenant()
