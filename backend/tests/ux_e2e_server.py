"""Run the real application against disposable SQLite and a local streaming model."""

import asyncio
import gzip
import importlib.util
import json
import os
import socket
import sys
import tempfile
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path

from langchain_core.messages import AIMessage, AIMessageChunk, ToolMessage

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = Path(os.environ.get("UX_E2E_DIR") or tempfile.mkdtemp(prefix="fastcore-ux-e2e-"))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
tempfile.tempdir = str(ARTIFACTS)
sys.path.insert(0, str(ROOT))
os.environ["ENVIRONMENT"] = "dev"
os.environ["ANONYMIZED_TELEMETRY"] = "False"

from app.config import path_conf

path_conf.ENV_DIR = ARTIFACTS / "environment"
path_conf.LOG_DIR = ARTIFACTS / "logs"
path_conf.UPLOAD_DIR = ARTIFACTS / "uploads"
path_conf.DOWNLOAD_DIR = ARTIFACTS / "downloads"

fixture_spec = importlib.util.spec_from_file_location("ux_test_fixtures", ROOT / "tests" / "conftest.py")
fixtures = importlib.util.module_from_spec(fixture_spec)
fixture_spec.loader.exec_module(fixtures)

from fastapi import FastAPI
from sqlalchemy import select

from app.api.v1.module_system.log.model import OperationLogModel
from app.core.database import async_db_session, async_engine
from app.core.logger import logger
from app.plugin.module_ai.chat import capabilities, model_config_service, rag
from app.plugin.module_ai.chat.model import ChatSessionModel
from app.plugin.module_ai.chat.service import ChatService
from app.plugin.module_ai.chat.usage_model import AiUsageRecordModel
from app.plugin.module_ai.config import settings as ai_settings
from app.plugin.module_ai.knowledge import service as knowledge_service
from app.plugin.module_ai.knowledge.bm25_index import BM25KnowledgeIndex

knowledge_service.UPLOAD_DIR = ARTIFACTS / "knowledge"
ai_settings.CHROMA_PERSIST_DIR = str(ARTIFACTS / "chroma")
ai_settings.BM25_INDEX_DIR = str(ARTIFACTS / "bm25")
ai_settings.LOCAL_EMBEDDING_CACHE_DIR = str(ARTIFACTS / "embeddings")
ai_settings.RETRIEVAL_MODE = "bm25"
ai_settings.BM25_TOKENIZER = "char"
ai_settings.OPENAI_API_KEY = "synthetic-fixture-only"
ai_settings.OPENAI_MODEL = "local-e2e-model"
ai_settings.OPENAI_BASE_URL = "https://fixture.invalid"
ai_settings.MODEL_ALLOWED_HOSTS = ["fixture.invalid"]
if os.environ.get("UX_E2E_LOG_ANALYSIS") == "1":
    logger.error("LOG-E2E-DIAG-42 backend index timeout api_key=SYNTHETIC-LOG-SECRET-42 | cid=abcde042")
    for index in range(70):
        logger.info("FULL-LOG-E2E context-{} | cid=fulle042", index)
    logger.error("FULL-LOG-E2E Traceback\n{}ValueError: FULL-ROOT-CAUSE api_key=SYNTHETIC-LOG-SECRET-42 | cid=fulle042", "  worker frame\n" * 1000)
    archive_time = datetime.now() - timedelta(days=2)
    archive_name = f"fastcore.{archive_time:%Y-%m-%d_%H-%M-%S_%f}.log.gz"
    with gzip.open(path_conf.LOG_DIR / archive_name, "wt", encoding="utf-8") as archive:
        archive.write(f"{archive_time:%Y-%m-%d %H:%M:%S.%f}"[:23] + " | ERROR    | app.worker:run:42 - FULL-LOG-E2E ARCHIVE-ROOT api_key=SYNTHETIC-LOG-SECRET-42 | cid=fulle042\n")

FEATURES = os.environ.get("UX_E2E_FEATURES") == "1"

observations = {"model_calls": 0, "attachment_in_prompt": False, "cancelled_calls": 0, "failed_calls": 0}
observations.update({"log_model_calls": 0, "log_evidence_in_prompt": False, "log_secret_in_prompt": False, "log_tool_schema_received": False})
observations.update({"complete_log_evidence": False, "archive_evidence": False})
observations.update({"feature_provider_calls": 0, "feature_provider_events": []})


class LocalToolModel:
    def __init__(self, config):
        self.config = config
        self.tool_name = None

    def bind_tools(self, tools):
        self.tool_name = (tools[0].get("function") or tools[0])["name"]
        observations["log_tool_schema_received"] |= self.tool_name == "query_runtime_logs"
        return self

    async def ainvoke(self, messages):
        if FEATURES:
            observations["feature_provider_calls"] += 1
            observations["feature_provider_events"].append({"operation": "tools" if self.tool_name else "complete", "model": self.config.model})
            if self.config.model == "unsupported-e2e-model":
                raise RuntimeError("Synthetic unsupported model for capability failure acceptance")
            if self.tool_name == "capability_probe":
                return AIMessage(content="", tool_calls=[{"name": "capability_probe", "id": "local-probe", "args": {"value": "probe-ok"}}], usage_metadata={"input_tokens": 2, "output_tokens": 3, "total_tokens": 5})
            if len(messages) == 1:
                return AIMessage(content="probe-ok", usage_metadata={"input_tokens": 2, "output_tokens": 3, "total_tokens": 5})
        if len(messages) > 1 and "工具不支持测试" in messages[1].content:
            raise NotImplementedError("Synthetic unsupported tool interface")
        if isinstance(messages[-1], ToolMessage):
            await asyncio.sleep(1.2)
            observations["log_model_calls"] += 1
            observations["log_evidence_in_prompt"] |= "LOG-E2E-DIAG-42" in messages[-1].content
            observations["log_secret_in_prompt"] |= "SYNTHETIC-LOG-SECRET-42" in messages[-1].content
            if "完整日志验收" in messages[1].content:
                results = [json.loads(message.content) for message in messages if isinstance(message, ToolMessage)]
                observations["complete_log_evidence"] |= any(len(result["entries"]) >= 70 for result in results)
                observations["archive_evidence"] |= any("ARCHIVE-ROOT" in entry["message"] for result in results for entry in result["entries"])
                if len(results) < 4:
                    return AIMessage(content="", tool_calls=[{"name": "query_runtime_logs", "id": f"local-full-{len(results) + 1}", "args": {"minutes": 4320, "keyword": "full-log-e2e", "correlation_id": "fulle042"}}])
                assert all(not result["truncated"] for result in results)
                assert any("FULL-ROOT-CAUSE" in entry["message"] for result in results for entry in result["entries"])
                return AIMessage(content="完整日志验收：已取得70条 INFO 上下文、完整异常堆栈和轮转归档，经过四次查询；只读分析，没有执行修复 [1]。")
            if sum(isinstance(message, ToolMessage) for message in messages) == 1 and "两次查询" in messages[1].content:
                return AIMessage(content="", tool_calls=[{"name": "query_runtime_logs", "id": "local-log-second", "args": {"minutes": 15, "levels": ["ERROR"], "keyword": "LOG-E2E-DIAG-42", "correlation_id": "abcde042"}}])
            return AIMessage(content="已证实：后台索引出现 timeout [1]。可能原因仍需排查连接与资源；没有执行修复。")
        if "完整日志验收" in messages[1].content:
            return AIMessage(content="", tool_calls=[
                {"name": "query_runtime_logs", "id": "local-full-info", "args": {"minutes": 4320, "levels": ["INFO"], "keyword": "full-log-e2e"}},
                {"name": "query_runtime_logs", "id": "local-full-error", "args": {"minutes": 4320, "levels": ["ERROR"], "keyword": "full-log-e2e"}},
            ])
        if "LOG-E2E-DIAG-42" in messages[-1].content:
            minutes = 60
            if "上次只读查询条件" in messages[-1].content:
                previous = json.loads(messages[-1].content.split("：", 1)[1].split("。", 1)[0])
                assert previous["keyword"] == "LOG-E2E-DIAG-42"
                assert previous["correlation_id"] == "abcde042"
                assert "SYNTHETIC-LOG-SECRET-42" not in str(messages)
                minutes = 5
            return AIMessage(
                content="",
                tool_calls=[
                    {
                        "name": "query_runtime_logs",
                        "id": "local-log-call",
                        "args": {"minutes": minutes, "levels": ["ERROR"], "keyword": "LOG-E2E-DIAG-42", "correlation_id": "abcde042"},
                    }
                ],
            )
        return AIMessage(content="ordinary question")

    async def astream(self, messages):
        observations["feature_provider_calls"] += 1
        observations["feature_provider_events"].append({"operation": "stream", "model": self.config.model})
        if self.config.model == "unsupported-e2e-model":
            raise RuntimeError("Synthetic unsupported model for capability failure acceptance")
        prompt = messages[0].content
        if prompt.startswith("Reply with exactly: probe-ok"):
            yield AIMessageChunk(content="probe-")
            yield AIMessageChunk(content="ok")
            yield AIMessageChunk(content="", usage_metadata={"input_tokens": 3, "output_tokens": 4, "total_tokens": 7})
            return
        async for text in local_stream(prompt):
            yield AIMessageChunk(content=text)


async def local_stream(prompt):
    observations["model_calls"] += 1
    if "错误测试" in prompt and observations["failed_calls"] == 0:
        observations["failed_calls"] += 1
        raise RuntimeError("Synthetic model failure for browser recovery acceptance")
    observations["attachment_in_prompt"] |= "UX-E2E-ORCHID-42" in prompt
    answer = "隔离验收回答：" + ("附件事实 UX-E2E-ORCHID-42 已进入真实 RAG 上下文。" if "UX-E2E-ORCHID-42" in prompt else "本地模型正在回复。")
    try:
        for chunk in answer:
            await asyncio.sleep(0.04 if "停止测试" not in prompt else 0.4)
            yield chunk
    except asyncio.CancelledError:
        observations["cancelled_calls"] += 1
        raise


class LocalModel(rag.LangChainChatModel):
    def __init__(self, config=None):
        self.config = config or model_config_service.get_active_chat_model_config()
        self.llm = LocalToolModel(self.config)

    async def stream(self, prompt):
        iterator = super().stream(prompt) if FEATURES else local_stream(prompt)
        try:
            async for text in iterator:
                yield text
        finally:
            await iterator.aclose()


rag.get_cached_chat_model = lambda: LocalModel()
if FEATURES:
    capabilities.LangChainChatModel = LocalModel
ChatService._trigger_memory_extraction = lambda *args, **kwargs: None
original_connect = socket.socket.connect
original_add_chunks = BM25KnowledgeIndex.add_chunks


async def slow_local_index(index, chunks):
    await asyncio.sleep(1.5)
    await original_add_chunks(index, chunks)


BM25KnowledgeIndex.add_chunks = slow_local_index


def local_connect(connection, address):
    if isinstance(address, tuple) and address[0] not in {"127.0.0.1", "::1", "localhost"}:
        raise RuntimeError("Isolated UX acceptance forbids non-loopback network access")
    return original_connect(connection, address)


socket.socket.connect = local_connect
inner_app = fixtures._ai_app
demo_production_check = os.environ.get("UX_E2E_DEMO_ENV") == "prod"
if demo_production_check:
    from app.common.enums import EnvironmentEnum
    from main import create_app

    fixtures.settings.ENVIRONMENT = EnvironmentEnum.PROD
    inner_app = create_app()


@asynccontextmanager
async def lifespan(application):
    if demo_production_check:
        # 初始化旧的开发菜单，验收切换到生产后不会暴露已有范例导航。
        from app.scripts.startup_policy import validate_database_schema

        fixtures.settings.ENVIRONMENT = EnvironmentEnum.DEV
        async with fixtures._test_lifespan(inner_app):
            fixtures.settings.ENVIRONMENT = EnvironmentEnum.PROD
            await validate_database_schema()
            yield
        return
    async with fixtures._test_lifespan(inner_app):
        yield


application = FastAPI(lifespan=lifespan)
application.mount("/api/v1", inner_app)


@application.post("/__ux_e2e/log-state")
async def reset_log_test_state(expire_context: bool = False):
    if expire_context:
        for key in list(fixtures._mock_redis_store):
            if (key.decode() if isinstance(key, bytes) else key).startswith("ai:log-context:"):
                fixtures._mock_redis_store.pop(key)
    return {"reset": True}


@application.get("/__ux_e2e/evidence")
async def evidence():
    async with async_db_session() as database:
        sessions = (await database.execute(select(ChatSessionModel))).scalars().all()
        runs = [run for session in sessions for run in (session.runs or [])]
        citations = [citation for run in runs for message in run.get("messages", []) for citation in message.get("citations", [])]
        ai_audits = (await database.execute(select(OperationLogModel).where(OperationLogModel.request_path.endswith("/ai/chat/ai-chat")))).scalars().all()
        usage_rows = (await database.scalars(select(AiUsageRecordModel).order_by(AiUsageRecordModel.id))).all() if FEATURES else []
    return {
        **observations,
        "feature_usage_ledger": [{"id": row.id, "user_id": row.user_id, "model": row.model, "purpose": row.purpose, "status": row.status, "input_tokens": row.input_tokens, "output_tokens": row.output_tokens, "total_tokens": row.total_tokens} for row in usage_rows],
        "database": async_engine.url.database,
        "artifacts": str(ARTIFACTS),
        "sessions": len(sessions),
        "persisted_runs": len(runs),
        "persisted_citations": len(citations),
        "ai_audits": len(ai_audits),
        "ai_audit_payloads_omitted": bool(ai_audits) and all(json.loads(row.request_payload) == {"omitted": True} and json.loads(row.response_json) == {"omitted": True} for row in ai_audits),
        "citation_titles": [citation.get("title") for citation in citations],
        "boundary": "real HTTP/WebSocket/auth/SQLite/RagChatChain; in-memory Redis; deterministic local model; attachment retrieval; no provider or embedding requests",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(application, host="127.0.0.1", port=8009, access_log=False)
