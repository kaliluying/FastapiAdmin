import json

from fastapi import APIRouter, WebSocket

from app.core.database import async_db_session
from app.core.dependencies import _verify_token
from app.core.logger import logger
from app.core.router_class import OperationLogRoute

from .schema import ChatQuerySchema
from .service import ChatService

WS_AI = APIRouter(
    route_class=OperationLogRoute,
    prefix="/ai/chat",
    tags=["AI Chat WebSocket"],
)


@WS_AI.websocket("/ws", name="WebSocket Chat")
async def websocket_chat_controller(websocket: WebSocket) -> None:
    await websocket.accept()

    token = websocket.query_params.get("token")
    if not token:
        logger.warning(f"WebSocket connection missing token: {websocket.client}")
        try:
            await websocket.send_text("未提供认证 token，请重新登录")
        except RuntimeError:
            logger.warning("WebSocket connection closed before auth error could be sent")
        finally:
            try:
                await websocket.close()
            except RuntimeError:
                pass
        return

    try:
        async with async_db_session() as db:
            redis = websocket.app.state.redis
            auth = await _verify_token(token, db, redis)
            user_info = f"用户: {auth.user.username}" if auth and auth.user else "未认证用户"
            logger.info(f"WebSocket connected: {websocket.client} - {user_info}")
            websocket.state.auth = auth

            while True:
                data = await websocket.receive_text()
                try:
                    message_data = json.loads(data)
                    query = ChatQuerySchema(**message_data)
                    logger.info(f"收到聊天查询: {query} - 会话ID: {query.session_id}")

                    async with db.begin():
                        async for chunk in ChatService(auth).chat_query(query=query):
                            if not chunk:
                                continue
                            try:
                                await websocket.send_text(chunk)
                            except RuntimeError:
                                logger.warning("WebSocket connection closed; stopping response stream")
                                break
                except json.JSONDecodeError:
                    logger.warning(f"收到非 JSON 消息: {data}")
                    try:
                        await websocket.send_text("消息格式错误，请发送 JSON 格式的消息")
                    except RuntimeError:
                        logger.warning("WebSocket connection closed before format error could be sent")
                        break
                except Exception as e:
                    logger.error(f"处理消息时出错: {e}")
                    try:
                        await websocket.send_text(f"处理消息时出错: {e}")
                    except RuntimeError:
                        logger.warning("WebSocket connection closed before processing error could be sent")
                        break
    except Exception as e:
        logger.warning(f"WebSocket authentication or chat failed: {e}")
        try:
            await websocket.send_text(f"错误: {e}")
        except RuntimeError:
            logger.warning("WebSocket connection closed before final error could be sent")
        finally:
            try:
                await websocket.close()
            except RuntimeError:
                pass
