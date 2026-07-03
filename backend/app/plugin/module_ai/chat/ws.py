import json

from fastapi import APIRouter, WebSocket
from starlette.status import WS_1008_POLICY_VIOLATION
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
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


async def _resolve_ws_auth(websocket: WebSocket, db: AsyncSession) -> AuthSchema:
    token = websocket.query_params.get("token")
    if not token:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)

    redis = websocket.app.state.redis
    return await _verify_token(token, db, redis)


@WS_AI.websocket("/ws", name="WebSocket Chat")
async def websocket_chat_controller(websocket: WebSocket) -> None:
    try:
        async with async_db_session() as db:
            try:
                auth = await _resolve_ws_auth(websocket, db)
            except Exception as e:
                logger.warning(f"WebSocket authentication failed: {websocket.client} - {e}")
                await websocket.close(code=WS_1008_POLICY_VIOLATION)
                return

            # _resolve_ws_auth 内部通过 _load_user_from_db 执行了查询，
            # 因 autocommit=False 会留下隐式事务。在进入消息循环前提交清场，
            # 否则后续 async with db.begin() 会触发 "transaction already begun"。
            commit = getattr(db, "commit", None)
            if commit:
                await commit()

            await websocket.accept()

            user_info = f"用户: {auth.user.username}" if auth and auth.user else "未知用户"
            logger.info(f"WebSocket connected: {websocket.client} - {user_info}")
            websocket.state.auth = auth

            while True:
                data = await websocket.receive_text()
                try:
                    message_data = json.loads(data)
                    query = ChatQuerySchema(**message_data)
                    logger.info(f"收到聊天查询: {query} - 会话ID: {query.session_id}")

                    async with db.begin():
                        auth.db = db
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
        logger.warning(f"WebSocket chat failed: {e}")
        try:
            await websocket.send_text(f"错误: {e}")
        except RuntimeError:
            logger.warning("WebSocket connection closed before final error could be sent")
        finally:
            try:
                await websocket.close()
            except RuntimeError:
                pass
