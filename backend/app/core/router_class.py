import json
import time
from collections.abc import Callable, Coroutine
from typing import Any

from fastapi import Request, Response
from fastapi.routing import APIRoute
from starlette.types import Message, Receive, Scope, Send

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
    """在审计落库前递归替换疑似凭据的值。

    Args:
        value: 已解析的请求或响应内容。
        key: 当前值所属的映射键；非映射值可不提供。

    Returns:
        可安全序列化到操作日志的副本。
    """
    normalized_key = "".join(character for character in (key or "").lower() if character.isalnum())
    if normalized_key and (
        normalized_key in _SENSITIVE_FIELD_NAMES
        or "apikey" in normalized_key
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
    """序列化已脱敏的操作日志内容，并限制存储长度。

    Args:
        value: 待序列化为审计记录的请求或响应内容。

    Returns:
        按存储长度限制截断的 JSON 文本。
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
    """在完整请求、事务和响应生命周期结束后写入操作审计。"""

    async def handle(self, scope: Scope, receive: Receive, send: Send) -> None:
        if (
            not settings.OPERATION_LOG_RECORD
            or scope["method"] not in settings.OPERATION_RECORD_METHOD
            or self.name in settings.IGNORE_OPERATION_FUNCTION
        ):
            await super().handle(scope, receive, send)
            return

        start = time.perf_counter()
        request = Request(scope, receive)
        omitted = (self.openapi_extra or {}).get("x-audit-payload") is False
        record = {
            "request_path": request.url.path,
            "request_method": request.method,
            "request_payload": _serialize_log_value({"omitted": True} if omitted else {}),
            "response_code": 500,
            "response_json": _serialize_log_value({"omitted": True} if omitted else {}),
            "description": self.summary or "",
        }
        request.state.operation_log_data = record

        async def audit_send(message: Message) -> None:
            if message["type"] == "http.response.start":
                record["response_code"] = message["status"]
            await send(message)

        failure_type = None
        try:
            await super().handle(scope, receive, audit_send)
        except BaseException as error:
            failure_type = type(error).__name__
            raise
        finally:
            # 路由已准备成功响应后，依赖收尾时的事务提交仍可能失败。
            if failure_type is not None or record["response_code"] >= 400:
                record["request_payload"] = _serialize_log_value({"omitted": True})
                record["response_json"] = _serialize_log_value({
                    "omitted": True, **({"error_type": failure_type} if failure_type else {}),
                })
            ctx = getattr(request.state, "ctx", None)
            current_user_id = ctx.user_id if ctx else None
            record.update(
                process_time=f"{(time.perf_counter() - start):.2f}s",
                created_id=current_user_id,
                updated_id=current_user_id,
            )
            await _write_operation_log_async(record)

    def get_route_handler(self) -> Callable[[Request], Coroutine[Any, Any, Response]]:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            record = getattr(request.state, "operation_log_data", None)
            if record is None:
                return await original_route_handler(request)

            response = None
            try:
                response = await original_route_handler(request)
                return response
            finally:
                try:
                    if response is None:
                        # 请求被拒绝或取消后，不能仅为审计而继续读取未消费的请求体。
                        record["request_payload"] = _serialize_log_value({"omitted": True})
                    elif (self.openapi_extra or {}).get("x-audit-payload") is not False:
                        oper_param: dict[str, Any] = {}
                        response_payload: Any = {}
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

                        if response is not None and "application/json" in response.headers.get("Content-Type", "") and getattr(response, "body", None):
                            try:
                                response_payload = json.loads(response.body.decode())
                            except (json.JSONDecodeError, UnicodeDecodeError):
                                response_payload = {"message": "响应不是可解析的 JSON，已省略"}
                        record.update(request_payload=_serialize_log_value(oper_param), response_json=_serialize_log_value(response_payload))
                except Exception:
                    logger.warning("操作日志采集异常: {}", request.url.path, exc_info=True)

        return custom_route_handler
