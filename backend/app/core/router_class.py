import json
import time
from collections.abc import Callable, Coroutine
from typing import Any

from fastapi import Request, Response
from fastapi.routing import APIRoute
from starlette.background import BackgroundTask

from app.config.setting import settings
from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.logger import logger

_SENSITIVE_FIELD_NAMES = frozenset(
    {
        "access",
        "apikey",
        "authorization",
        "captcha",
        "credential",
        "password",
        "refresh",
        "secret",
        "token",
    }
)
_LOG_VALUE_LIMIT = 2000


def _redact_sensitive_values(value: Any, key: str | None = None) -> Any:
    """Recursively replace credential-like values before audit persistence.

    Args:
        value: Parsed request or response payload.
        key: Current mapping key, if the value belongs to one.

    Returns:
        A copy safe to serialize into an operation log.
    """
    normalized_key = "".join(character for character in (key or "").lower() if character.isalnum())
    if normalized_key and (
        normalized_key in _SENSITIVE_FIELD_NAMES
        or "password" in normalized_key
        or "token" in normalized_key
        or "captcha" in normalized_key
        or "secret" in normalized_key
        or "credential" in normalized_key
    ):
        return "***"
    if isinstance(value, dict):
        return {str(item_key): _redact_sensitive_values(item_value, str(item_key)) for item_key, item_value in value.items()}
    if isinstance(value, list):
        return [_redact_sensitive_values(item) for item in value]
    return value


def _serialize_log_value(value: Any) -> str:
    """Serialize and cap a redacted operation-log payload.

    Args:
        value: Request or response content ready for audit serialization.

    Returns:
        JSON text capped to the storage policy length.
    """
    text = json.dumps(_redact_sensitive_values(value), ensure_ascii=False, default=str)
    return text if len(text) <= _LOG_VALUE_LIMIT else "日志内容过长，已省略"


async def _write_operation_log_async(log_data: dict) -> None:
    from app.api.v1.module_system.log.schema import OperationLogCreateSchema
    from app.api.v1.module_system.log.service import OperationLogService
    try:
        async with async_db_session() as _session:
            async with _session.begin():
                _auth = AuthSchema(db=_session)
                await OperationLogService(_auth).create(data=OperationLogCreateSchema(**log_data))
    except Exception:
        logger.exception("操作日志写入失败: path={}", log_data.get("request_path"))


class OperationLogRoute(APIRoute):
    """操作日志路由 — 自动记录请求/响应并后台异步写入"""

    def get_route_handler(self) -> Callable[[Request], Coroutine[Any, Any, Response]]:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            start = time.time()
            response: Response = await original_route_handler(request)

            if not settings.OPERATION_LOG_RECORD or request.method not in settings.OPERATION_RECORD_METHOD:
                return response
            route: APIRoute = request.scope.get("route", None)
            if route and route.name in settings.IGNORE_OPERATION_FUNCTION:
                return response

            try:
                oper_param: dict[str, Any] = {}
                content_type = request.headers.get("Content-Type", "")
                if content_type.startswith(("multipart/form-data", "application/x-www-form-urlencoded")):
                    form_data = await request.form()
                    oper_param["form"] = dict(form_data.items())
                else:
                    payload = await request.body()
                    if payload:
                        try:
                            oper_param["body"] = json.loads(payload.decode())
                        except (json.JSONDecodeError, UnicodeDecodeError):
                            oper_param["body"] = "非 JSON 请求体已省略"

                if request.path_params:
                    oper_param["path_params"] = dict(request.path_params)

                is_json = "application/json" in response.headers.get("Content-Type", "")
                response_payload: Any = {}
                if is_json and getattr(response, "body", None):
                    try:
                        response_payload = json.loads(response.body.decode())
                    except (json.JSONDecodeError, UnicodeDecodeError):
                        response_payload = {"message": "响应不是可解析的 JSON，已省略"}

                ctx = getattr(request.state, "ctx", None)
                current_user_id = ctx.user_id if ctx else None

                log_data: dict[str, Any] = {
                    "request_path": request.url.path,
                    "request_method": request.method,
                    "request_payload": _serialize_log_value(oper_param),
                    "response_code": response.status_code,
                    "response_json": _serialize_log_value(response_payload),
                    "process_time": f"{(time.time() - start):.2f}s",
                    "description": route.summary if route else "",
                    "created_id": current_user_id,
                    "updated_id": current_user_id,
                }
                response.background = BackgroundTask(_write_operation_log_async, log_data)
            except Exception:
                logger.warning("操作日志采集异常: {}", request.url.path, exc_info=True)
            return response

        return custom_route_handler
