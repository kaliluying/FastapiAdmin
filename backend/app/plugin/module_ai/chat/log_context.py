from uuid import uuid4

from redis.asyncio import Redis

from app.core.exceptions import CustomException

from .runtime_logs import RuntimeLogQuerySchema


class LogQueryContexts:
    def __init__(self, ttl: int = 600):
        self.ttl = ttl

    async def put(self, redis: Redis, owner: tuple[int, str], query: RuntimeLogQuerySchema) -> str:
        context_id = uuid4().hex
        await redis.set(f"ai:log-context:{owner[0]}:{owner[1]}:{context_id}", query.model_dump_json(), ex=self.ttl)
        return context_id

    async def get(self, redis: Redis, context_id: str, owner: tuple[int, str]) -> RuntimeLogQuerySchema:
        raw = await redis.get(f"ai:log-context:{owner[0]}:{owner[1]}:{context_id}")
        if raw is None:
            raise CustomException(
                msg="临时日志查询条件已失效，请重新描述时间、关键词或请求 ID",
                status_code=410,
                data={"error_code": "log_context_expired"},
            )
        return RuntimeLogQuerySchema.model_validate_json(raw)


log_query_contexts = LogQueryContexts()
