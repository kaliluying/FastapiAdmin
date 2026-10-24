"""Owner isolation, live source authorization and idempotent run submission."""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import func, select, update

from app.api.v1.module_system.user.model import UserModel
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.plugin.module_ai.chat.public import authorize_runtime_log_access, redact_log_text
from app.plugin.module_ai.knowledge.public import accessible_knowledge_base_ids

from .model import AgentEventModel as Event
from .model import AgentRunModel as Run
from .schema import AgentRunCreateSchema

TERMINAL = frozenset({"succeeded", "failed", "cancelled"})


async def authorize_sources(auth: AuthSchema, run) -> None:
    if run.use_runtime_logs:
        await authorize_runtime_log_access(auth)
    await accessible_knowledge_base_ids(auth.model_copy(update={"check_data_scope": True}), run.knowledge_base_ids)


def snapshot(run: Run, events=()) -> dict:
    return {
        "run_id": run.run_id, "goal": run.goal, "status": run.status,
        "created_at": run.created_at.isoformat(), "updated_at": run.updated_at.isoformat(),
        "result": run.result, "error": run.error, "knowledge_base_ids": run.knowledge_base_ids,
        "use_runtime_logs": run.use_runtime_logs, "model_calls": run.model_calls,
        "tool_calls": run.tool_calls, "attempts": run.attempts, "last_seq": run.last_seq,
        "citations": run.citations,
        "events": [{"seq": event.seq, "type": event.type, "message": event.message,
                    "data": event.data, "created_at": event.created_at.isoformat()} for event in events],
    }


async def create_run(auth: AuthSchema, data: AgentRunCreateSchema) -> dict:
    if not auth.session_id:
        raise CustomException(msg="请重新登录后创建诊断任务", status_code=401)
    await authorize_sources(auth, data)
    # End source-read snapshots before serializing submissions on MySQL.
    await auth.db.rollback()
    await auth.db.execute(update(UserModel).where(UserModel.id == auth.user.id).values(
        id=UserModel.id, updated_time=UserModel.updated_time,
    ))
    existing = await auth.db.scalar(select(Run).where(Run.user_id == auth.user.id, Run.request_id == data.request_id).with_for_update())
    goal = redact_log_text(data.goal)
    if existing:
        if (existing.goal, existing.knowledge_base_ids, existing.use_runtime_logs) != (goal, data.knowledge_base_ids, data.use_runtime_logs):
            raise CustomException(msg="该提交编号已用于其他诊断任务", status_code=409)
        return snapshot(existing)
    active = await auth.db.scalar(select(func.count()).select_from(Run).where(Run.user_id == auth.user.id, Run.status.in_(("pending", "running"))))
    if active >= 3:
        raise CustomException(msg="最多同时保留三个进行中的诊断任务，请等待或取消后重试", status_code=409)
    run = Run(
        run_id=uuid4().hex, user_id=auth.user.id, session_id=auth.session_id,
        request_id=data.request_id, goal=goal, knowledge_base_ids=data.knowledge_base_ids,
        use_runtime_logs=data.use_runtime_logs,
    )
    auth.db.add(run)
    await auth.db.flush()
    return snapshot(run)


async def get_run(auth: AuthSchema, run_id: str, *, after_seq: int = 0) -> dict:
    run = await auth.db.scalar(select(Run).where(Run.run_id == run_id, Run.user_id == auth.user.id))
    if run is None:
        raise CustomException(msg="诊断任务不存在或无权访问", status_code=404)
    # Detach before live checks, which may roll back their own SQL reads.
    auth.db.expunge(run)
    await authorize_sources(auth, run)
    events = (await auth.db.scalars(select(Event).where(Event.run_id == run_id, Event.seq > after_seq).order_by(Event.seq).limit(200))).all()
    # Reauthorize after the latest snapshot so a concurrent source revocation cannot
    # return evidence read under the first authorization window.
    current = await auth.db.scalar(select(Run).where(Run.run_id == run_id, Run.user_id == auth.user.id))
    if current is None:
        raise CustomException(msg="诊断任务不存在或无权访问", status_code=404)
    auth.db.expunge(current)
    await authorize_sources(auth, current)
    events = (await auth.db.scalars(select(Event).where(Event.run_id == run_id, Event.seq > after_seq).order_by(Event.seq).limit(200))).all()
    return snapshot(current, events)


async def list_runs(auth: AuthSchema, limit: int) -> list[dict]:
    runs = (await auth.db.scalars(select(Run).where(Run.user_id == auth.user.id).order_by(Run.created_at.desc()).limit(limit))).all()
    # Lists contain no evidence or report; source permissions are rechecked on detail.
    return [{**snapshot(run), "result": None, "citations": []} for run in runs]


async def cancel_run(auth: AuthSchema, run_id: str) -> dict:
    run = await auth.db.scalar(select(Run).where(Run.run_id == run_id, Run.user_id == auth.user.id).with_for_update())
    if run is None:
        raise CustomException(msg="诊断任务不存在或无权访问", status_code=404)
    if run.status not in TERMINAL:
        run.status, run.token, run.lease_until = "cancelled", None, None
        run.updated_at = datetime.now()
        run.last_seq += 1
        auth.db.add(Event(run_id=run.run_id, seq=run.last_seq, type="cancelled", message="任务已取消；不会再发布新的结果或事件，已准入的外部调用可能继续至返回", data={}))
        await auth.db.flush()
    return {**snapshot(run), "result": None, "citations": []}
