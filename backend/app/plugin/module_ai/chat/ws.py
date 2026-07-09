import json

from fastapi import APIRouter, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import WS_1008_POLICY_VIOLATION

from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.dependencies import _verify_token
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
    token = websocket.query_params.get("token")
    if not token:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)

    redis = websocket.app.state.redis
    return await _verify_token(token, db, redis)


def _has_ws_permission(auth: AuthSchema, permission: str) -> bool:
    user = getattr(auth, "user", None)
    if not user:
        return False
    if getattr(user, "is_superuser", False):
        return True

    for role in getattr(user, "roles", []) or []:
        if getattr(role, "status", None) != 0:
            continue
        for menu in getattr(role, "menus", []) or []:
            if getattr(menu, "status", None) == 0 and getattr(menu, "permission", None) == permission:
                return True
    return False


@WS_AI.websocket("/ws", name="WebSocket Chat")
async def websocket_chat_controller(websocket: WebSocket) -> None:
    # 认证阶段：短生命周期 session，认证后立即释放数据库连接
    auth: AuthSchema | None = None
    try:
        async with async_db_session() as db:
            auth = await _resolve_ws_auth(websocket, db)
            if not _has_ws_permission(auth, "module_ai:chat:ws"):
                raise CustomException(msg="无权限操作", code=10403, status_code=403)
            # _resolve_ws_auth 内部执行了查询留下隐式事务，提交清场以确保
            # auth.user 的已加载属性在 session 关闭后仍可从内存访问
            await db.commit()
    except Exception as e:
        logger.warning(f"WebSocket authentication failed: {websocket.client} - {e}")
        await websocket.close(code=WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    user_info = f"用户: {auth.user.username}" if auth and auth.user else "未知用户"
    logger.info(f"WebSocket connected: {websocket.client} - {user_info}")

    # 消息循环：每条消息独立 session，空闲等待时不占用数据库连接
    while True:
        try:
            data = await websocket.receive_text()
        except Exception:
            logger.info(f"WebSocket disconnected: {websocket.client}")
            break
        try:
            message_data = json.loads(data)
            query = ChatQuerySchema(**message_data)
            logger.info(f"收到聊天查询: {query} - 会话ID: {query.session_id}")

            async with async_db_session() as db:
                async with db.begin():
                    auth.db = db
                    async for chunk in ChatService(auth).chat_query(query=query):
                        if not chunk:
                            continue
                        try:
                            await websocket.send_text(chunk)
                        except RuntimeError:
                            logger.warning("WebSocket connection closed; stopping response stream")
                            return
        except json.JSONDecodeError:
            logger.warning(f"收到非 JSON 消息: {data}")
            try:
                await websocket.send_text("消息格式错误，请发送 JSON 格式的消息")
            except RuntimeError:
                break
        except Exception as e:
            logger.error(f"处理消息时出错: {e}")
            try:
                await websocket.send_text(f"处理消息时出错: {e}")
            except RuntimeError:
                break
