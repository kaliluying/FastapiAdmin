import asyncio
import json
from contextlib import suppress

from fastapi import APIRouter, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import WS_1008_POLICY_VIOLATION

from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.dependencies import _verify_ws_ticket
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.core.router_class import OperationLogRoute

from .schema import ChatQuerySchema
from .service import ChatService

WS_AI = APIRouter(
    route_class=OperationLogRoute,
    prefix="/ai/chat",
    tags=["AI Chat WebSocket"],
)


async def _resolve_ws_auth(websocket: WebSocket, db: AsyncSession) -> AuthSchema:
    ticket = websocket.query_params.get("ticket")
    if not ticket:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)

    redis = websocket.app.state.redis
    auth = await _verify_ws_ticket(ticket, db, redis)
    return auth.model_copy(update={"check_data_scope": True})


def _has_ws_permission(auth: AuthSchema, permission: str) -> bool:
    user = getattr(auth, "user", None)
    if not user:
        return False
    if getattr(user, "is_superuser", False):
        return True

    return permission in getattr(auth, "permission_map", {})


@WS_AI.websocket("/ws", name="WebSocket Chat")
async def websocket_chat_controller(websocket: WebSocket) -> None:
    # 认证阶段：短生命周期 session，认证后立即释放数据库连接
    auth: AuthSchema | None = None
    try:
        async with async_db_session() as db:
            auth = await _resolve_ws_auth(websocket, db)
            if not _has_ws_permission(auth, "module_ai:chat:ws"):
                raise CustomException(msg="无权限操作", code=10403, status_code=403)
            # _resolve_ws_auth 内部只做只读查询，且 EXPIRE_ON_COMMIT=False，
            # 无需提交即可在 session 关闭后继续访问 auth.user 的已加载属性
    except Exception as e:
        logger.warning(f"WebSocket authentication failed: {websocket.client} - {e}")
        await websocket.close(code=WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    user_info = f"用户: {auth.user.username}" if auth and auth.user else "未知用户"
    logger.info(f"WebSocket connected: {websocket.client} - {user_info}")
    active_task: asyncio.Task | None = None
    active_request_id: str | None = None

    async def send_event(request_id: str | None, event: dict) -> None:
        if request_id:
            await websocket.send_text(json.dumps({**event, "request_id": request_id}, ensure_ascii=False))
        elif event.get("type") == "chunk":
            await websocket.send_text(event["content"])
        elif event.get("type") == "error":
            await websocket.send_text(event["message"])

    async def stream_query(query: ChatQuerySchema) -> None:
        try:
            async with async_db_session() as db:
                auth.db = db
                options = {"structured": True} if query.request_id else {}
                async for chunk in ChatService(auth).chat_query(query=query, **options):
                    if chunk:
                        event = chunk if isinstance(chunk, dict) else {"type": "chunk", "content": chunk}
                        await send_event(query.request_id, event)
        except asyncio.CancelledError:
            with suppress(Exception):
                await send_event(query.request_id, {"type": "cancelled"})
            raise
        except Exception:
            logger.exception("聊天流处理失败")
            with suppress(Exception):
                await send_event(query.request_id, {"type": "error", "message": "回答中断，请重试"})

    try:
        while True:
            request_id = None
            try:
                data = await websocket.receive_text()
            except Exception:
                break
            try:
                if len(data) > 120_000:
                    raise ValueError("message too large")
                message_data = json.loads(data)
                if not isinstance(message_data, dict):
                    raise ValueError("message must be an object")
                request_id = message_data.get("request_id")
                if message_data.get("type") == "cancel":
                    if active_task and not active_task.done() and request_id == active_request_id:
                        active_task.cancel()
                        with suppress(asyncio.CancelledError):
                            await active_task
                    continue
                query = ChatQuerySchema(**message_data)
                if active_task and not active_task.done():
                    await send_event(query.request_id, {"type": "error", "message": "上一条回答尚未结束，请等待或停止生成"})
                    continue
                active_request_id = query.request_id
                active_task = asyncio.create_task(stream_query(query))
                await asyncio.sleep(0)
            except Exception:
                await send_event(request_id if isinstance(request_id, str) and len(request_id) <= 64 else None, {"type": "error", "message": "消息格式错误，请检查问题和附件大小后重试"})
    finally:
        if active_task and not active_task.done():
            active_task.cancel()
            with suppress(asyncio.CancelledError):
                await active_task
        logger.info("WebSocket disconnected: %s", websocket.client)
