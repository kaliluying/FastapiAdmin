import asyncio
import json
import time
from collections.abc import Callable, Coroutine
from typing import Any

from fastapi import Request, Response
from fastapi.routing import APIRoute

from app.config.setting import settings
from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.logger import logger


async def _write_operation_log_async(log_data: dict) -> None:
    """
    后台异步写入操作日志，不阻塞请求响应。

    在独立的 DB session 中写入，避免复用请求上下文中的 session。
    """
    from app.api.v1.module_system.log.schema import OperationLogCreateSchema
    from app.api.v1.module_system.log.service import OperationLogService
    try:
        async with async_db_session() as _session:
            async with _session.begin():
                _auth = AuthSchema(db=_session)
                await OperationLogService.create_service(
                    data=OperationLogCreateSchema(**log_data),
                    auth=_auth,
                )
    except Exception as e:
        logger.warning(f"后台异步写入操作日志失败: {e}")


"""
在 FastAPI 中，route_class 参数用于自定义路由的行为。
通过设置 route_class，你可以定义一个自定义的路由类，从而在每个路由处理之前或之后执行特定的操作。
这对于日志记录、权限验证、性能监控等场景非常有用。
"""


class OperationLogRoute(APIRoute):
    """操作日志路由装饰器"""

    def get_route_handler(
        self,
    ) -> Callable[[Request], Coroutine[Any, Any, Response]]:
        """
        自定义路由处理程序,在每个路由处理之前或之后执行特定的操作。

        参数:
        - request (Request): FastAPI请求对象。

        返回:
        - Response: FastAPI响应对象。
        """
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            """
            自定义路由处理程序,在每个路由处理之前或之后执行特定的操作。

            参数:
            - request (Request): FastAPI请求对象。
            描述:
            - 该方法在每个路由处理之前被调用,用于记录操作日志。
            返回:
            - Response: FastAPI响应对象。
            """
            start_time = time.time()
            # 请求前的处理
            response: Response = await original_route_handler(request)

            # 请求后的处理（异步写入操作日志，不阻塞响应）
            if not settings.OPERATION_LOG_RECORD:
                return response
            if request.method not in settings.OPERATION_RECORD_METHOD:
                return response
            route: APIRoute = request.scope.get("route", None)
            if route and route.name in settings.IGNORE_OPERATION_FUNCTION:
                return response

            # ── 收集日志数据（在请求上下文中同步完成）──
            try:
                payload = b"{}"
                req_content_type = request.headers.get("Content-Type", "")

                oper_param: dict[str, Any] = {}
                if req_content_type and req_content_type.startswith(
                    ("multipart/form-data", "application/x-www-form-urlencoded")
                ):
                    form_data = await request.form()
                    oper_param["form"] = dict(form_data.items())
                else:
                    payload = await request.body()
                    if payload:
                        try:
                            oper_param["body"] = json.loads(payload.decode())
                        except (json.JSONDecodeError, UnicodeDecodeError):
                            oper_param["body"] = payload.decode("utf-8", errors="ignore")

                path_params = request.path_params
                if path_params:
                    oper_param["path_params"] = dict(path_params)

                log_payload = json.dumps(oper_param, ensure_ascii=False)
                if len(log_payload) > 2000:
                    log_payload = "请求参数过长"

                response_data = (
                    response.body
                    if "application/json" in response.headers.get("Content-Type", "")
                    else b"{}"
                )
                process_time = f"{(time.time() - start_time):.2f}s"

                current_user_id = request.scope.get("user_id")

                # 构造日志数据字典，传给后台任务
                log_data: dict[str, Any] = {
                    "request_path": request.url.path,
                    "request_method": request.method,
                    "request_payload": log_payload,
                    "response_code": response.status_code,
                    "response_json": (
                        response_data.decode()
                        if isinstance(response_data, (bytes, bytearray))
                        else str(response_data)
                    ),
                    "process_time": process_time,
                    "description": route.summary if route else "",
                    "created_id": current_user_id,
                    "updated_id": current_user_id,
                }

                # ── 后台异步写入，不阻塞响应 ──
                asyncio.create_task(_write_operation_log_async(log_data))
            except Exception:
                logger.warning(f"操作日志采集异常: {request.url.path}", exc_info=True)
            return response

        return custom_route_handler
