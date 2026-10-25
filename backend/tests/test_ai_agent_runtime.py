import asyncio
import json
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from langchain_core.messages import AIMessage, AIMessageChunk, HumanMessage, SystemMessage, ToolMessage, messages_from_dict, messages_to_dict
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.v1.module_system.user.model import UserModel
from app.core.exceptions import CustomException
from app.core.security import credential_fingerprint
from app.plugin.module_ai.agent import runtime
from app.plugin.module_ai.agent.model import AgentEventModel as Event
from app.plugin.module_ai.agent.model import AgentRunModel as Run
from app.plugin.module_ai.agent.service import cancel_run, get_run, list_runs, snapshot

LIVE_AUTH = runtime.live_auth


@pytest.fixture
async def runs(monkeypatch, tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'agent.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(Run.__table__.create)
        await connection.run_sync(Event.__table__.create)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(runtime, "async_db_session", sessions)

    @asynccontextmanager
    async def live(run, redis):
        yield SimpleNamespace(user=SimpleNamespace(id=run.user_id))

    monkeypatch.setattr(runtime, "live_auth", live)
    monkeypatch.setattr(runtime, "tool_definitions", lambda **kwargs: [{"type": "function", "function": {"name": "query_runtime_logs"}}])
    monkeypatch.setattr(runtime, "execute_tool", AsyncMock(return_value={
        "summary": "找到一条诊断证据", "evidence": [{"message": "fixture evidence"}],
        "citations": [{"id": "temporary", "title": "fixture", "snippet": "fixture evidence", "source": "runtime-log"}],
    }))
    yield sessions
    await engine.dispose()


async def enqueue(sessions, **values):
    async with sessions() as db, db.begin():
        run = Run(run_id=uuid4().hex, user_id=1, session_id="fixture-session",
                  request_id=uuid4().hex, goal="诊断错误", knowledge_base_ids=[], use_runtime_logs=True, **values)
        db.add(run)
        await db.flush()
        return run.run_id


async def read(sessions, identifier):
    async with sessions() as db:
        return await db.get(Run, identifier)


def set_model(monkeypatch, responses):
    model = SimpleNamespace(request_tools=AsyncMock(side_effect=responses))
    monkeypatch.setattr(runtime, "prepare_tool_model", AsyncMock(return_value=model))
    return model


def tool(identifier="read-1", name="query_runtime_logs"):
    return AIMessage(content="", tool_calls=[{"id": identifier, "name": name, "args": {}}])


async def analysis_events(sessions):
    async with sessions() as db:
        return list((await db.scalars(select(Event).where(Event.type == "analysis").order_by(Event.seq))).all())


async def test_snapshot_dates_identify_server_instants_for_remote_browser_clocks(runs):
    identifier = await enqueue(runs)
    job = await runtime.record(await runtime.claim_run(), "model_call", "start")
    async with runs() as db:
        event = await db.scalar(select(Event).where(Event.run_id == identifier))
    result = snapshot(job, [event])
    for value, original in [(result["created_at"], job.created_at),
                            (result["updated_at"], job.updated_at),
                            (result["events"][0]["created_at"], event.created_at)]:
        parsed = datetime.fromisoformat(value)
        assert parsed.tzinfo is not None
        assert parsed.timestamp() == original.timestamp()


async def test_stream_persists_public_lines_before_end_and_merges_split_tools(runs, monkeypatch):
    closed = []

    async def stream(*_):
        try:
            yield AIMessageChunk(content="先查询日志。\n")
            events = await analysis_events(runs)
            assert len(events) == 1 and events[0].data["complete"] is False
            yield AIMessageChunk(content="", tool_call_chunks=[
                {"index": 0, "id": "read-1", "name": "query_runtime_logs", "args": '{"keyword":"to'},
            ])
            yield AIMessageChunk(content="", tool_call_chunks=[
                {"index": 0, "id": None, "name": None, "args": 'ken=private-secret"}'},
            ])
        finally:
            closed.append(True)

    await enqueue(runs)
    job = await runtime.record(await runtime.claim_run(), "model_call", "start")
    _, answer = await runtime.request_analysis(job, None, SimpleNamespace(stream_tools=stream), [], [])
    assert closed == [True]
    assert answer.tool_calls[0]["args"] == {"keyword": "token=private-secret"}
    assert (await analysis_events(runs))[-1].data == {
        "model_call": 1, "text": "先查询日志。", "complete": True,
    }


async def test_stream_redacts_accumulated_secrets_and_excludes_private_blocks(runs, monkeypatch):
    monkeypatch.setattr(runtime, "ANALYSIS_INTERVAL", 0)

    async def stream(*_):
        yield AIMessageChunk(content=[{"type": "thinking", "thinking": "internal-secret", "signature": "private-signature"},
                                      {"type": "text", "text": "公开摘要\npassword=split-"}])
        private_key = "-----BEGIN " + "PRIVATE KEY-----\nkey-body\n-----END " + "PRIVATE KEY-----"
        yield AIMessageChunk(content=[{"type": "text", "text": "secret\n" + private_key + "\n结束。"}])

    await enqueue(runs)
    job = await runtime.record(await runtime.claim_run(), "model_call", "start")
    await runtime.request_analysis(job, None, SimpleNamespace(stream_tools=stream), [], [])
    serialized = json.dumps([item.data for item in await analysis_events(runs)], ensure_ascii=False)
    for secret in ("internal-secret", "private-signature", "split-", "secret", "key-body"):
        assert secret not in serialized
    assert "[REDACTED]" in serialized
    assert (await analysis_events(runs))[-1].data["complete"] is True


@pytest.mark.parametrize("quote", ['"', "'"])
@pytest.mark.parametrize("key", ["password", "cookie", "cookies", "set-cookie", "authorization", "proxy-authorization"])
async def test_stream_never_persists_unclosed_multiline_secret_values(runs, monkeypatch, quote, key):
    monkeypatch.setattr(runtime, "ANALYSIS_INTERVAL", 0)

    async def stream(*_):
        for text in [f"公开说明\n{key}={quote}synthetic-line-one\n",
                     "synthetic-line-two\\\n", "synthetic-tail\\", quote + "\n"]:
            yield AIMessageChunk(content=text)

    await enqueue(runs)
    job = await runtime.record(await runtime.claim_run(), "model_call", "start")
    await runtime.request_analysis(job, None, SimpleNamespace(stream_tools=stream), [], [])
    events = await analysis_events(runs)
    assert events
    assert "synthetic-" not in json.dumps([item.data for item in events])
    assert events[-1].data["complete"] is True


async def test_stream_snapshots_are_bounded_and_always_finish(runs, monkeypatch):
    monkeypatch.setattr(runtime, "ANALYSIS_INTERVAL", 0)

    async def stream(*_):
        for _index in range(30):
            yield AIMessageChunk(content="公开句子\n")
        yield AIMessageChunk(content="后文" * runtime.MAX_ANALYSIS_CHARS)

    await enqueue(runs)
    job = await runtime.record(await runtime.claim_run(), "model_call", "start")
    await runtime.request_analysis(job, None, SimpleNamespace(stream_tools=stream), [], [])
    events = await analysis_events(runs)
    assert len(events) == runtime.MAX_ANALYSIS_UPDATES
    assert events[-1].data["complete"] is True
    assert len(events[-1].data["text"]) == runtime.MAX_ANALYSIS_CHARS
    assert all(len(item.data["text"]) <= runtime.MAX_ANALYSIS_CHARS for item in events)


@pytest.mark.parametrize("stop", ["cancel", "lease", "auth"])
async def test_stream_stops_and_closes_on_cancel_lease_loss_or_revoked_auth(runs, monkeypatch, stop):
    closed = []
    monkeypatch.setattr(runtime, "ANALYSIS_INTERVAL", 0)

    async def stream(*_):
        try:
            yield AIMessageChunk(content="已公开。\n")
            if stop == "auth":
                @asynccontextmanager
                async def revoked(*_):
                    raise CustomException(msg="权限已撤销")
                    yield
                monkeypatch.setattr(runtime, "live_auth", revoked)
            else:
                async with runs() as db, db.begin():
                    await db.execute(update(Run).where(Run.run_id == job.run_id).values(
                        **({"status": "cancelled", "token": None} if stop == "cancel" else {"token": "replacement"})
                    ))
            yield AIMessageChunk(content="不能公开的新内容。\n")
        finally:
            closed.append(True)

    await enqueue(runs)
    job = await runtime.record(await runtime.claim_run(), "model_call", "start")
    with pytest.raises(CustomException if stop == "auth" else runtime.RunStopped):
        await runtime.request_analysis(job, None, SimpleNamespace(stream_tools=stream), [], [])
    assert closed == [True]
    assert [item.data["text"] for item in await analysis_events(runs)] == ["已公开。"]


@pytest.mark.parametrize("failure", ["empty", "error", "oversize"])
async def test_bad_stream_fails_without_second_provider_request(runs, failure):
    async def stream(*_):
        if failure == "error":
            raise RuntimeError("provider interrupted")
        if failure == "oversize":
            yield AIMessageChunk(content="x" * (runtime.MAX_CONTEXT_CHARS + 1))

    fallback = AsyncMock()
    await enqueue(runs)
    job = await runtime.record(await runtime.claim_run(), "model_call", "start")
    with pytest.raises(RuntimeError if failure == "error" else CustomException):
        await runtime.request_analysis(job, None, SimpleNamespace(stream_tools=stream, request_tools=fallback), [], [])
    fallback.assert_not_called()
    assert await analysis_events(runs) == []


@pytest.mark.parametrize("arguments", ['{"minutes":', '{"minutes":30', '{"keyword":"partial', "[]"])
async def test_stream_rejects_truncated_json_instead_of_executing_repaired_defaults(runs, monkeypatch, arguments):
    async def stream(*_):
        yield AIMessageChunk(content="", tool_call_chunks=[
            {"index": 0, "id": "read-1", "name": "query_runtime_logs", "args": arguments},
        ])

    monkeypatch.setattr(runtime, "prepare_tool_model", AsyncMock(return_value=SimpleNamespace(stream_tools=stream)))
    identifier = await enqueue(runs)
    await runtime.process_run(await runtime.claim_run(), None)
    saved = await read(runs, identifier)
    assert saved.status == "failed"
    runtime.execute_tool.assert_not_called()


@pytest.mark.parametrize("stop_reason", [None, "tool_use"])
async def test_only_completed_native_empty_tool_input_can_omit_json_deltas(runs, stop_reason):
    async def stream(*_):
        yield AIMessageChunk(content=[{"type": "tool_use", "id": "read-1", "name": "query_runtime_logs", "input": {}}],
                             tool_call_chunks=[{"index": 0, "id": "read-1", "name": "query_runtime_logs", "args": ""}],
                             response_metadata={"stop_reason": stop_reason})

    await enqueue(runs)
    job = await runtime.record(await runtime.claim_run(), "model_call", "start")
    if stop_reason is None:
        with pytest.raises(CustomException, match="未完整"):
            await runtime.request_analysis(job, None, SimpleNamespace(stream_tools=stream), [], [])
    else:
        _, answer = await runtime.request_analysis(job, None, SimpleNamespace(stream_tools=stream), [], [])
        assert answer.tool_calls[0]["args"] == {}


async def test_success_is_durable_with_ordered_events_and_bounded_identity(runs, monkeypatch):
    model = set_model(monkeypatch, [tool(), AIMessage(content="发现异常，见 [1]。")])
    identifier = await enqueue(runs)
    job = await runtime.claim_run()
    await runtime.process_run(job, None)
    saved = await read(runs, identifier)
    assert (saved.status, saved.result, saved.model_calls, saved.tool_calls, saved.attempts) == ("succeeded", "发现异常，见 [1]。", 2, 1, 1)
    assert saved.token is None and saved.lease_until is None
    assert saved.citations[0]["id"] == "1"
    assert model.request_tools.await_count == 2
    async with runs() as db:
        events = (await db.scalars(select(Event).order_by(Event.seq))).all()
    assert [item.seq for item in events] == list(range(1, saved.last_seq + 1))
    assert events[-1].type == "succeeded"
    started = next(item.data for item in events if item.type == "tool_started")
    completed = next(item.data for item in events if item.type == "tool_completed")
    assert started["call_id"] == completed["call_id"] == "read-1"
    assert started["attempt"] == completed["attempt"] == 1
    assert started["arguments"] == runtime.validate_tool_arguments(
        "query_runtime_logs", {}, use_runtime_logs=True, knowledge_base_ids=[],
    )
    with pytest.raises(runtime.RunStopped):
        await runtime.record(job, "failed", "stale worker")


@pytest.mark.parametrize("provider", ["responses", "anthropic"])
async def test_reasoning_and_validated_calls_survive_checkpoint_and_provider_conversion(runs, monkeypatch, provider):
    from langchain_anthropic.chat_models import _format_messages
    from langchain_openai.chat_models.base import _construct_responses_api_input

    arguments = {"keyword": "token=private-secret"}
    if provider == "responses":
        reasoning = {"type": "reasoning", "id": "rs_fixture", "summary": [], "encrypted_content": "opaque-cipher"}
        block = {"type": "function_call", "id": "fc_fixture", "call_id": "read-1",
                 "name": "query_runtime_logs", "arguments": json.dumps(arguments)}
    else:
        reasoning = {"type": "thinking", "thinking": "signed fixture reasoning", "signature": "opaque-signature"}
        block = {"type": "tool_use", "id": "read-1", "name": "query_runtime_logs", "input": arguments}
    answer = AIMessage(
        content=[reasoning, block], tool_calls=[{"id": "read-1", "name": "query_runtime_logs", "args": arguments}],
        response_metadata={"private": "provider-private"}, additional_kwargs={"private": "provider-private"},
    )
    set_model(monkeypatch, [answer, AIMessage(content="已核实 [1]。")])
    identifier = await enqueue(runs)
    await runtime.process_run(await runtime.claim_run(), None)
    saved = await read(runs, identifier)
    assert saved.status == "succeeded"
    restored = messages_from_dict(json.loads(json.dumps(saved.messages)))
    assistant = next(message for message in restored if isinstance(message, AIMessage))
    assert assistant.content[0] == reasoning
    assert assistant.response_metadata == {} and assistant.additional_kwargs == {}
    assert "provider-private" not in json.dumps(saved.messages)
    assert "private-secret" not in json.dumps(saved.messages)
    validated = runtime.validate_tool_arguments("query_runtime_logs", arguments, use_runtime_logs=True, knowledge_base_ids=[])
    assert assistant.tool_calls[0]["args"] == validated
    if provider == "responses":
        payload = _construct_responses_api_input(restored)
        assert reasoning in payload
        call = next(item for item in payload if item.get("type") == "function_call")
        assert call["id"] == "fc_fixture" and call["call_id"] == "read-1"
        assert json.loads(call["arguments"]) == validated
        assert payload[-1]["type"] == "function_call_output"
        assert reasoning in _construct_responses_api_input(restored, store=False)
    else:
        _, payload = _format_messages(restored, model=None)
        assert payload[1]["content"][0] == reasoning
        call = payload[1]["content"][1]
        assert call["id"] == "read-1" and call["input"] == validated
        assert payload[-1]["content"][0]["tool_use_id"] == "read-1"


def test_reasoning_checkpoint_has_same_context_limit_and_rejects_unmatched_tool_blocks():
    answer = AIMessage(content=[{"type": "reasoning", "encrypted_content": "x" * runtime.MAX_CONTEXT_CHARS}])
    with pytest.raises(CustomException, match="上下文上限"):
        runtime.checkpoint([runtime.assistant_message(answer, [], "")])
    answer = AIMessage(content=[{"type": "function_call", "call_id": "unvalidated", "arguments": "{}"}])
    with pytest.raises(CustomException, match="不一致"):
        runtime.assistant_message(answer, [], "")


async def test_restart_only_repeats_unfinished_read_and_preserves_budget(runs, monkeypatch):
    messages = [
        SystemMessage(content="fixture"), HumanMessage(content="question"),
        AIMessage(content="", tool_calls=[
            {"id": "done", "name": "query_runtime_logs", "args": {}},
            {"id": "unfinished", "name": "query_runtime_logs", "args": {}},
        ]),
        ToolMessage(content="empty result", tool_call_id="done", name="query_runtime_logs"),
    ]
    identifier = await enqueue(runs, messages=messages_to_dict(messages), model_calls=1, tool_calls=1,
                               status="running", lease_until=datetime.now() - timedelta(seconds=1), token="old", attempts=1)
    set_model(monkeypatch, [AIMessage(content="已核对 [1]。")])
    recovered = await runtime.claim_run()
    assert recovered.attempts == 2
    await runtime.process_run(recovered, None)
    saved = await read(runs, identifier)
    assert saved.status == "succeeded"
    assert (saved.model_calls, saved.tool_calls) == (2, 2)
    assert runtime.execute_tool.await_count == 1
    async with runs() as db:
        assert await db.scalar(select(Event.type).where(Event.seq == 1)) == "recovering"


async def test_expired_lease_and_cancel_fence_stale_workers(runs):
    identifier = await enqueue(runs)
    old = await runtime.claim_run()
    async with runs() as db, db.begin():
        await db.execute(update(Run).where(Run.run_id == identifier).values(lease_until=datetime.now() - timedelta(seconds=1)))
    replacement = await runtime.claim_run()
    assert replacement.token != old.token
    with pytest.raises(runtime.RunStopped):
        await runtime.record(old, "tool_completed", "must not publish")
    async with runs() as db, db.begin():
        await db.execute(update(Run).where(Run.run_id == identifier).values(status="cancelled", token=None))
    with pytest.raises(runtime.RunStopped):
        await runtime.record(replacement, "succeeded", "must not publish")


async def test_final_state_gate_rejects_cancelled_run_before_provider_call(runs):
    identifier = await enqueue(runs)
    claimed = await runtime.claim_run()
    async with runs() as db, db.begin():
        await db.execute(update(Run).where(Run.run_id == identifier).values(status="cancelled", token=None, lease_until=None))
    with pytest.raises(runtime.RunStopped):
        await runtime.ensure_run_active(claimed)


async def test_model_returning_after_cancel_cannot_publish_or_call_tools(runs, monkeypatch):
    identifier = await enqueue(runs)

    async def response(*args):
        async with runs() as db, db.begin():
            await db.execute(update(Run).where(Run.run_id == identifier).values(status="cancelled", token=None, lease_until=None))
        return tool()

    set_model(monkeypatch, response)
    await runtime.process_run(await runtime.claim_run(), None)
    assert (await read(runs, identifier)).status == "cancelled"
    runtime.execute_tool.assert_not_called()


async def test_model_loop_stops_at_budget_even_across_restart(runs, monkeypatch):
    identifier = await enqueue(runs)
    set_model(monkeypatch, [tool(f"read-{index}") for index in range(runtime.MAX_MODEL_CALLS)])
    await runtime.process_run(await runtime.claim_run(), None)
    saved = await read(runs, identifier)
    assert saved.status == "failed" and "上限" in saved.error
    assert saved.model_calls == runtime.MAX_MODEL_CALLS
    assert saved.tool_calls == runtime.MAX_MODEL_CALLS


@pytest.mark.parametrize("responses", [
    [tool(name="run_shell")],
    [tool(), tool()],
    [AIMessage(content="结论，无需查询") for _ in range(runtime.MAX_MODEL_CALLS)],
])
async def test_invalid_calls_or_unsupported_answer_fail_closed(runs, monkeypatch, responses):
    identifier = await enqueue(runs)
    set_model(monkeypatch, responses)
    await runtime.process_run(await runtime.claim_run(), None)
    assert (await read(runs, identifier)).status == "failed"
    assert runtime.execute_tool.await_count <= 1


async def test_invalid_second_call_rejects_entire_batch_before_any_read(runs, monkeypatch):
    identifier = await enqueue(runs)
    set_model(monkeypatch, [AIMessage(content="", tool_calls=[
        {"id": "valid", "name": "query_runtime_logs", "args": {}},
        {"id": "invalid", "name": "query_runtime_logs", "args": {"path": "/etc/passwd"}},
    ])])
    await runtime.process_run(await runtime.claim_run(), None)
    saved = await read(runs, identifier)
    assert saved.status == "failed" and saved.tool_calls == 0
    assert saved.messages == []
    runtime.execute_tool.assert_not_called()


@pytest.mark.parametrize("answer", ["没有引用", "引用不存在 [999]", ""])
async def test_unverified_report_is_not_success(runs, monkeypatch, answer):
    identifier = await enqueue(runs)
    set_model(monkeypatch, [tool(), AIMessage(content=answer)])
    await runtime.process_run(await runtime.claim_run(), None)
    saved = await read(runs, identifier)
    assert saved.status == "failed" and saved.result is None


async def test_shutdown_releases_lease_without_clearing_checkpoint(runs, monkeypatch):
    identifier = await enqueue(runs)
    job = await runtime.claim_run()
    set_model(monkeypatch, AsyncMock(side_effect=asyncio.CancelledError))
    with pytest.raises(asyncio.CancelledError):
        await runtime.process_run(job, None)
    saved = await read(runs, identifier)
    assert saved.status == "running" and saved.lease_until <= datetime.now()
    assert saved.model_calls == 1


async def test_exhausted_recovery_has_terminal_state(runs):
    identifier = await enqueue(runs, attempts=runtime.MAX_ATTEMPTS, status="running", lease_until=datetime.now() - timedelta(seconds=1))
    assert await runtime.claim_run() is None
    saved = await read(runs, identifier)
    assert saved.status == "failed" and saved.token is None


async def test_exception_details_do_not_enter_persisted_error(runs, monkeypatch):
    identifier = await enqueue(runs)
    set_model(monkeypatch, [RuntimeError("provider private token=secret")])
    await runtime.process_run(await runtime.claim_run(), None)
    saved = await read(runs, identifier)
    assert saved.status == "failed" and "secret" not in saved.error


async def test_permission_revoked_during_model_call_blocks_output(runs, monkeypatch):
    checks = 0

    @asynccontextmanager
    async def revoked(run, redis):
        nonlocal checks
        checks += 1
        if checks >= 3:
            raise CustomException(msg="诊断权限已失效", status_code=403)
        yield SimpleNamespace()

    monkeypatch.setattr(runtime, "live_auth", revoked)
    identifier = await enqueue(runs)
    set_model(monkeypatch, [tool()])
    await runtime.process_run(await runtime.claim_run(), None)
    saved = await read(runs, identifier)
    assert saved.status == "failed" and "权限" in saved.error
    runtime.execute_tool.assert_not_called()


async def test_cancel_cannot_bypass_report_source_authorization(runs):
    identifier = await enqueue(runs, status="succeeded", result="private evidence",
                               citations=[{"id": "1", "snippet": "private evidence"}])
    async with runs() as db, db.begin():
        auth = SimpleNamespace(user=SimpleNamespace(id=1), db=db)
        result = await cancel_run(auth, identifier)
        assert result["status"] == "succeeded"
        assert result["result"] is None and result["citations"] == []
        listed = await list_runs(auth, 20)
        assert listed[0]["result"] is None and listed[0]["citations"] == []


async def test_owner_scope_includes_superuser_for_details_and_cancel(runs):
    identifier = await enqueue(runs)
    async with runs() as db:
        auth = SimpleNamespace(user=SimpleNamespace(id=2, is_superuser=True), db=db)
        for operation in (get_run, cancel_run):
            with pytest.raises(CustomException) as error:
                await operation(auth, identifier)
            assert error.value.status_code == 404
        assert await list_runs(auth, 20) == []


@pytest.mark.parametrize("scenario", ["valid", "logout", "other-user", "changed-password", "revoked-permission"])
async def test_background_auth_checks_original_session_and_current_credentials(runs, monkeypatch, scenario):
    identifier = await enqueue(runs)
    run = await read(runs, identifier)
    user = UserModel(id=1, username="fixture", name="fixture", password="current-hash",
                     is_superuser=scenario != "revoked-permission")
    info = {"user_id": 2 if scenario == "other-user" else 1,
            "credential_fingerprint": credential_fingerprint(1, "old-hash" if scenario == "changed-password" else "current-hash")}
    redis = SimpleNamespace(get=AsyncMock(return_value=None if scenario == "logout" else json.dumps(info)))
    monkeypatch.setattr(runtime, "_check_token_online", AsyncMock())
    monkeypatch.setattr(runtime, "_load_authenticated_user", AsyncMock(return_value=user))
    monkeypatch.setattr(runtime, "_build_permission_map", lambda _: {})
    monkeypatch.setattr(runtime, "authorize_sources", AsyncMock())
    if scenario == "valid":
        async with LIVE_AUTH(run, redis) as auth:
            assert auth.user.id == 1 and auth.session_id == run.session_id
            assert not auth.db.in_transaction()
    else:
        with pytest.raises(CustomException) as error:
            async with LIVE_AUTH(run, redis):
                pytest.fail("invalid identity must not reach the model or tools")
        assert error.value.status_code in {401, 403}
