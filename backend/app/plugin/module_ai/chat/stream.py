"""请求作用域内的 SSE，提供有界缓冲并在连接断开时取消任务。"""

import asyncio
import json
from contextlib import aclosing

import anyio
from fastapi.responses import StreamingResponse
from fastapi.sse import format_sse_event

from app.core.database import async_db_session
from app.core.exceptions import CustomException
from app.core.logger import logger

from .service import ChatService

_PING_INTERVAL = 15


class ChatStreamResponse(StreamingResponse):
    async def __call__(self, scope, receive, send):
        # ASGI 2.4 默认只在写入时检测断开；等待模型期间也必须立即取消。
        async with anyio.create_task_group() as group:
            async def run(function):
                try:
                    await function()
                finally:
                    group.cancel_scope.cancel()

            group.start_soon(run, lambda: self.stream_response(send))
            await run(lambda: self.listen_for_disconnect(receive))
        if self.background is not None:
            await self.background()

    async def stream_response(self, send):
        try:
            await super().stream_response(send)
        finally:
            with anyio.CancelScope(shield=True):
                await self.body_iterator.aclose()


async def chat_events(auth, query):
    queue = asyncio.Queue(maxsize=1)

    async def produce():
        try:
            async with async_db_session() as db:
                current_auth = auth.model_copy(update={"db": db})
                async with aclosing(ChatService(current_auth).chat_query(query, structured=True)) as events:
                    async for event in events:
                        await queue.put({**event, "request_id": query.request_id})
        except CustomException as exc:
            if asyncio.current_task().cancelling():
                raise
            await queue.put({"type": "error", "message": exc.msg, "request_id": query.request_id})
        except Exception:
            if asyncio.current_task().cancelling():
                raise
            logger.warning("SSE 对话失败，不记录用户内容或模型异常详情")
            await queue.put({"type": "error", "message": "回答中断，请重试", "request_id": query.request_id})
        await queue.put(None)

    producer = asyncio.create_task(produce())
    try:
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=_PING_INTERVAL)
            except TimeoutError:
                yield format_sse_event(comment="ping")
                continue
            if event is None:
                break
            yield format_sse_event(data_str=json.dumps(event, ensure_ascii=False))
    finally:
        producer.cancel()
        with anyio.CancelScope(shield=True):
            await asyncio.gather(producer, return_exceptions=True)
