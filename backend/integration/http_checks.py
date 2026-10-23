"""通过真实 TCP HTTP 验证认证、知识库、SSE 与重启持久化。"""

import json
import os
import signal
import socket
import subprocess
import sys
import time
from contextlib import asynccontextmanager
from pathlib import Path
from unittest.mock import AsyncMock

from processes import run_isolated

MARKER = "TCPORCHIDPERSISTENCE"


def serve(port: int) -> None:
    import uvicorn

    from app.config.setting import settings
    from app.plugin.module_ai.chat import memory_worker as worker
    from app.plugin.module_ai.chat import rag, service
    from app.plugin.module_ai.knowledge import recovery
    from main import create_app

    class LocalModel:
        async def complete(self, prompt):
            assert MARKER in prompt
            return MARKER

        async def stream(self, prompt):
            yield await self.complete(prompt)

    async def memory_result(_):
        return '{"actions":[]}'

    async def ordinary_routing(*args, **kwargs):
        if False:
            yield

    # 只替换外部模型边界，检索、权限、事务和生产生命周期保持实际实现。
    rag.get_cached_chat_model = LocalModel
    worker.get_cached_chat_model = lambda: type("MemoryModel", (), {"complete": staticmethod(memory_result)})()
    service.ChatService._validate_ai_config = staticmethod(AsyncMock(return_value=None))
    service.ChatService._stream_log_analysis = ordinary_routing
    settings.CAPTCHA_ENABLE = False
    settings.RATE_LIMITER_TIMES = 1000
    application = create_app()
    actual_lifespan = application.router.lifespan_context
    shutdown_marker = Path(os.environ["FASTCORE_INTEGRATION_ROOT"]) / "http-shutdown"
    shutdown_marker.unlink(missing_ok=True)

    @asynccontextmanager
    async def checked_lifespan(app):
        async with actual_lifespan(app):
            yield
        assert not worker._workers and recovery._worker is None
        shutdown_marker.write_text("production shutdown completed", encoding="utf-8")

    application.router.lifespan_context = checked_lifespan
    uvicorn.run(application, host="127.0.0.1", port=port, log_level="warning")


def verify_http() -> dict:
    import httpx
    from sqlalchemy import create_engine, text

    from app.config.setting import settings

    root = Path(os.environ["FASTCORE_INTEGRATION_ROOT"])
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
    process = None
    log = None

    def stop():
        if process is not None and process.poll() is None:
            process.terminate()
            try:
                # Uvicorn 在完成清理后重新发送收到的 SIGTERM，因此退出码可能为 -15。
                assert process.wait(timeout=25) in {0, -signal.SIGTERM}, "HTTP 服务异常退出"
                assert (root / "http-shutdown").is_file(), "生产 shutdown 未完成"
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=5)
                raise
        if log is not None:
            log.close()

    def start(index):
        nonlocal process, log
        log = (root / f"http-server-{index}.log").open("w", encoding="utf-8")
        process = subprocess.Popen(
            [sys.executable, str(Path(__file__).resolve()), "--serve", str(port)],
            cwd=Path(__file__).resolve().parents[1], env=os.environ.copy(), stdout=log, stderr=log,
        )
        deadline = time.monotonic() + 60
        while time.monotonic() < deadline:
            assert process.poll() is None, f"HTTP 服务启动失败，见 {log.name}"
            try:
                response = client.get("/common/health/ready")
                if response.status_code == 200:
                    dependencies = response.json()["data"]["dependencies"]
                    assert dependencies["database"]["status"] == dependencies["redis"]["status"] == 1
                    return
            except httpx.TransportError:
                pass
            time.sleep(0.2)
        raise AssertionError("真实 HTTP readiness 超时")

    def data(response):
        assert response.status_code == 200, f"{response.request.method} {response.request.url.path}: {response.status_code}"
        payload = response.json()
        assert payload["success"] is True, payload.get("msg")
        return payload["data"]

    def wait_document(document_id):
        deadline = time.monotonic() + 45
        while time.monotonic() < deadline:
            result = data(client.get("/ai/knowledge/document/list", headers=headers, params={"knowledge_base_id": base_id}))
            item = next(item for item in result["items"] if item["id"] == document_id)
            assert item["index_status"] != "failed", item.get("error_message")
            if item["index_status"] == "success" and not item["replacement_pending"]:
                return item
            time.sleep(0.2)
        raise AssertionError("文档索引未完成")

    engine = create_engine(settings.DB_URI)
    try:
        with httpx.Client(base_url=f"http://127.0.0.1:{port}", timeout=60, trust_env=False) as client:
            start(0)
            assert client.get("/system/user/current/info").status_code == 401
            assert client.post("/system/auth/login", data={"username": "admin", "password": "incorrect"}).status_code >= 400
            login = data(client.post("/system/auth/login", data={"username": "admin", "password": "isolated-acceptance"}))
            headers = {"Authorization": "Bearer " + login["access_token"]}
            assert data(client.get("/system/user/current/info", headers=headers))["username"] == "admin"
            limited = data(client.post("/system/user/create", headers=headers, json={
                "username": "http-limited", "name": "受限验收用户", "password": "isolated-limited", "role_ids": [],
            }))
            limited_login = data(client.post("/system/auth/login", data={"username": "http-limited", "password": "isolated-limited"}))
            limited_headers = {"Authorization": "Bearer " + limited_login["access_token"]}
            assert client.post("/ai/knowledge/create", headers=limited_headers, json={"name": "forbidden"}).status_code == 403
            assert client.post("/ai/knowledge/create", headers=headers, json={"name": ""}).status_code == 422
            base = data(client.post("/ai/knowledge/create", headers=headers, json={"name": "TCP HTTP 验收", "is_enabled": True}))
            base_id = base["id"]
            changed = data(client.put(f"/ai/knowledge/update/{base_id}", headers=headers, json={"name": "TCP HTTP 验收修改", "is_enabled": False}))
            assert changed["is_enabled"] is False
            data(client.put(f"/ai/knowledge/update/{base_id}", headers=headers, json={"name": "TCP HTTP 验收修改", "is_enabled": True}))
            original = f"隔离测试事实：{MARKER}。".encode()
            document = data(client.post("/ai/knowledge/document/upload", headers=headers, data={"knowledge_base_id": base_id}, files={"file": ("http.txt", original, "text/plain")}))
            document_id = document["id"]
            assert wait_document(document_id)["chunk_count"] > 0
            downloaded = client.get(f"/ai/knowledge/document/{document_id}/file", headers=headers)
            assert downloaded.status_code == 200 and downloaded.content == original
            hits = data(client.post("/ai/knowledge/retrieval/test", headers=headers, json={"query": MARKER, "knowledge_base_ids": [base_id]}))["results"]
            assert hits and any(MARKER in hit["content"] for hit in hits)
            with client.stream("POST", "/ai/chat/stream", headers=headers, json={
                "message": MARKER, "knowledge_base_ids": [base_id], "request_id": "tcp-acceptance",
            }) as response:
                assert response.status_code == 200
                events = [json.loads(line[5:].strip()) for line in response.iter_lines() if line.startswith("data:")]
            assert not any(event["type"] == "error" for event in events), events
            assert any(event["type"] == "citations" and event["citations"] for event in events)
            assert "".join(event["content"] for event in events if event["type"] == "chunk") == MARKER
            done = next(event for event in events if event["type"] == "done")
            session_id = done["session_id"]
            with engine.connect() as connection:
                original_path = connection.execute(text("SELECT file_path FROM ai_knowledge_document WHERE id=:id"), {"id": document_id}).scalar_one()
                assert connection.execute(text("SELECT count(*) FROM ai_knowledge_chunk WHERE document_id=:id"), {"id": document_id}).scalar_one() > 0
                assert connection.execute(text("SELECT count(*) FROM sys_user WHERE id=:id"), {"id": limited["id"]}).scalar_one() == 1
            stop()
            start(1)
            assert data(client.get("/system/user/current/info", headers=headers))["username"] == "admin"
            persisted = data(client.get(f"/ai/chat/detail/{session_id}", headers=headers))
            assert MARKER in json.dumps(persisted, ensure_ascii=False)
            assert client.get(f"/ai/knowledge/document/{document_id}/file", headers=headers).content == original
            replacement = f"替换后的事实：{MARKER}REPLACED。".encode()
            data(client.post(f"/ai/knowledge/document/{document_id}/replace", headers=headers, files={"file": ("replace.txt", replacement, "text/plain")}))
            wait_document(document_id)
            assert client.get(f"/ai/knowledge/document/{document_id}/file", headers=headers).content == replacement
            with engine.connect() as connection:
                replacement_path = connection.execute(text("SELECT file_path FROM ai_knowledge_document WHERE id=:id"), {"id": document_id}).scalar_one()
            data(client.request("DELETE", "/ai/knowledge/document/delete", headers=headers, json=[document_id]))
            deadline = time.monotonic() + 45
            while True:
                with engine.connect() as connection:
                    deleted = connection.execute(text("SELECT is_deleted, index_status, file_path, pending_file, file_cleanup_paths, index_cleanup_ids, index_token, index_lease_until FROM ai_knowledge_document WHERE id=:id"), {"id": document_id}).one()
                    active_chunks = connection.execute(text("SELECT count(*) FROM ai_knowledge_chunk WHERE document_id=:id AND is_deleted=false"), {"id": document_id}).scalar_one()
                if deleted[0] and deleted[1] == "deleted":
                    assert all(value is None for value in deleted[2:])
                    assert active_chunks == 0
                    assert not any((root / "knowledge" / path).exists() for path in (original_path, replacement_path))
                    from app.plugin.module_ai.knowledge.bm25_index import get_cached_bm25_index

                    with get_cached_bm25_index()._get_index().searcher() as searcher:
                        assert not list(searcher.documents(document_id=str(document_id)))
                    break
                assert time.monotonic() < deadline, "软删除后文件和索引清理未完成"
                time.sleep(0.2)
            data(client.request("DELETE", "/ai/knowledge/delete", headers=headers, json=[base_id]))
            with engine.connect() as connection:
                assert connection.execute(text("SELECT is_deleted FROM ai_knowledge_document WHERE id=:id"), {"id": document_id}).scalar_one()
                assert connection.execute(text("SELECT is_deleted FROM ai_knowledge_base WHERE id=:id"), {"id": base_id}).scalar_one()
            data(client.post("/system/auth/logout", headers=headers))
            assert client.get("/system/user/current/info", headers=headers).status_code == 401
            browser = run_isolated(
                ["node", str(Path(__file__).with_name("browser_checks.cjs")), str(port)],
                cwd=Path(__file__).resolve().parents[1], env=os.environ.copy(), timeout=120,
            )
            assert browser.returncode == 0, "浏览器页面验收失败"
            with engine.connect() as connection:
                assert connection.execute(text("SELECT count(*) FROM ai_knowledge_base WHERE name=:name AND is_deleted=false"), {"name": "浏览器全链路验收"}).scalar_one() == 1
    finally:
        stop()
        engine.dispose()
    return {
        "passed": True, "transport": "TCP HTTP to standalone Uvicorn process",
        "checks": ["readiness checks real database and Redis", "login, unauthorized request and RBAC denial",
                   "create user, validation failure and knowledge base CRUD", "upload, indexing, BM25 retrieval and original download",
                   "SSE retrieval citations, completion and SQL persistence", "process restart preserves Redis session and SQL data",
                   "document replacement; deletion clears SQL chunks, files and BM25 entries", "logout revokes real Redis session"],
        "boundary": "local deterministic chat/memory model; CAPTCHA disabled; no external model request",
    }


if __name__ == "__main__":
    from runtime_acceptance import configure_child

    configure_child()
    serve(int(sys.argv[2]))
