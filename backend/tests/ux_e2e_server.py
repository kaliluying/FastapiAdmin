"""Run the real application against disposable SQLite and a local streaming model."""

import asyncio
import importlib.util
import os
import socket
import sys
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = Path(os.environ.get("UX_E2E_DIR") or tempfile.mkdtemp(prefix="fastapiadmin-ux-e2e-"))
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

from app.core.database import async_db_session
from app.plugin.module_ai.chat import rag
from app.plugin.module_ai.chat.model import ChatSessionModel
from app.plugin.module_ai.chat.service import ChatService
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

observations = {"model_calls": 0, "attachment_in_prompt": False, "cancelled_calls": 0, "failed_calls": 0}


class LocalModel:
    async def stream(self, prompt):
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


rag.get_cached_chat_model = lambda: LocalModel()
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


@asynccontextmanager
async def lifespan(application):
    async with fixtures._test_lifespan(inner_app):
        yield


application = FastAPI(lifespan=lifespan)
application.mount("/api/v1", inner_app)


@application.get("/__ux_e2e/evidence")
async def evidence():
    async with async_db_session() as database:
        sessions = (await database.execute(select(ChatSessionModel))).scalars().all()
        runs = [run for session in sessions for run in (session.runs or [])]
        citations = [citation for run in runs for message in run.get("messages", []) for citation in message.get("citations", [])]
    return {
        **observations,
        "database": fixtures._TEST_DB_PATH,
        "artifacts": str(ARTIFACTS),
        "sessions": len(sessions),
        "persisted_runs": len(runs),
        "persisted_citations": len(citations),
        "citation_titles": [citation.get("title") for citation in citations],
        "boundary": "real HTTP/WebSocket/auth/SQLite/RagChatChain; in-memory Redis; deterministic local model; attachment retrieval; no provider or embedding requests",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(application, host="127.0.0.1", port=8009, access_log=False)
