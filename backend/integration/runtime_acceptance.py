"""Standalone acceptance against explicitly disposable, loopback MySQL and Redis."""

import argparse
import asyncio
import json
import os
import secrets
import signal
import subprocess
import sys
import tempfile
import time
from io import BytesIO
from pathlib import Path
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]


def validate_target(mysql_port: int, redis_port: int, acknowledged: bool) -> None:
    if not acknowledged:
        raise ValueError("必须确认 --disposable-services；只允许独立临时 MySQL/Redis 实例")
    if any(port < 1024 or port > 65535 for port in (mysql_port, redis_port)):
        raise ValueError("集成端口必须位于 1024..65535")
    if mysql_port in {3306, 6379} or redis_port in {3306, 6379} or mysql_port == redis_port:
        raise ValueError("拒绝默认或重复端口，请使用独立临时服务")


def configure_child() -> None:
    validate_target(int(os.environ["DATABASE_PORT"]), int(os.environ["REDIS_PORT"]), True)
    if os.environ["DATABASE_HOST"] != "127.0.0.1" or os.environ["REDIS_HOST"] != "127.0.0.1":
        raise ValueError("集成服务只允许 loopback 地址")
    artifact_root = Path(os.environ["FASTCORE_INTEGRATION_ROOT"]).resolve()
    if not artifact_root.is_relative_to(Path(tempfile.gettempdir()).resolve()) or not artifact_root.name.startswith("fastcore-integration-"):
        raise ValueError("集成产物必须位于系统临时目录")
    if not os.environ["DATABASE_NAME"].startswith("fastcore_ci_"):
        raise ValueError("拒绝非集成数据库")
    sys.path.insert(0, str(ROOT))
    from app.config import path_conf

    path_conf.ENV_DIR = artifact_root / "environment"
    path_conf.LOG_DIR = artifact_root / "logs"
    path_conf.UPLOAD_DIR = artifact_root / "uploads"
    path_conf.DOWNLOAD_DIR = artifact_root / "downloads"
    from app.plugin.module_ai.knowledge import service

    service.UPLOAD_DIR = artifact_root / "knowledge"


async def prepare_recovery() -> None:
    from fastapi import BackgroundTasks, UploadFile
    from sqlalchemy import select

    from app.api.v1.module_system.user.model import UserModel
    from app.core.base_schema import AuthSchema
    from app.core.database import async_db_session, async_engine
    from app.plugin.module_ai.knowledge.model import KnowledgeBaseModel
    from app.plugin.module_ai.knowledge.service import KnowledgeService

    try:
        async with async_db_session() as database:
            user_id = (await database.execute(select(UserModel.id).order_by(UserModel.id).limit(1))).scalar_one()
            base = KnowledgeBaseModel(name="isolated restart acceptance", created_id=user_id)
            database.add(base)
            await database.commit()
            service = KnowledgeService(AuthSchema(db=database, user=SimpleNamespace(id=user_id), check_data_scope=False))
            document = await service.upload_document(
                knowledge_base_id=base.id,
                file=UploadFile(filename="restart.txt", file=BytesIO("恢复验收事实：ORCHIDPERSISTENCE。".encode())),
                background_tasks=BackgroundTasks(),
            )
            assert document.index_status == "pending"
            root = Path(os.environ["FASTCORE_INTEGRATION_ROOT"])
            (root / "document.json").write_text(json.dumps({"document_id": document.id, "knowledge_base_id": base.id}), encoding="utf-8")
    finally:
        await async_engine.dispose()


async def run_recovery_phase(crash: bool) -> dict:
    from sqlalchemy import func, select

    from app.core.database import async_db_session, async_engine
    from app.plugin.module_ai.knowledge import recovery, service
    from app.plugin.module_ai.knowledge.bm25_index import get_cached_bm25_index
    from app.plugin.module_ai.knowledge.model import KnowledgeChunkModel, KnowledgeDocumentModel
    from main import create_app

    root = Path(os.environ["FASTCORE_INTEGRATION_ROOT"])
    fixture = json.loads((root / "document.json").read_text(encoding="utf-8"))
    document_id = fixture["document_id"]
    if crash:
        service.INDEX_LEASE_SECONDS = 2
        original_extract = service.extract_text

        async def pause_after_real_parse(file_path):
            result = await original_extract(file_path)
            assert "ORCHIDPERSISTENCE" in result
            (root / "index-claimed").write_text("real SQL lease committed; parser barrier entered", encoding="utf-8")
            await asyncio.Event().wait()
            return result

        service.extract_text = pause_after_real_parse

    application = create_app()
    try:
        async with application.router.lifespan_context(application):
            assert recovery._worker is not None, "恢复必须由真实生产 startup hook 启动"
            if crash:
                await asyncio.Event().wait()
            deadline = asyncio.get_running_loop().time() + 60
            while True:
                async with async_db_session() as database:
                    document = await database.get(KnowledgeDocumentModel, document_id)
                    status, attempts = document.index_status, document.index_attempts
                    if status == "success":
                        assert attempts == 2
                        assert document.index_token is None
                        assert document.index_lease_until is None
                        assert (service.UPLOAD_DIR / document.file_path).is_file()
                        count = (await database.execute(
                            select(func.count()).select_from(KnowledgeChunkModel).where(KnowledgeChunkModel.document_id == document_id, KnowledgeChunkModel.is_deleted == False)
                        )).scalar_one()
                        assert count > 0
                        break
                assert asyncio.get_running_loop().time() < deadline, f"真实重启未恢复文档，状态 {status}"
                await asyncio.sleep(0.2)
            index = get_cached_bm25_index()
            hits = await index.search("ORCHIDPERSISTENCE", [fixture["knowledge_base_id"]])
            assert hits and all(hit["document_id"] == document_id for hit in hits)
            with index._get_index().searcher() as searcher:
                assert len(list(searcher.documents(document_id=str(document_id)))) == count
        assert recovery._worker is None, "真实 shutdown 必须停止恢复任务"
        return {"pid": os.getpid(), "status": status, "attempts": attempts, "chunks": count, "searchable": True}
    finally:
        await async_engine.dispose()


async def verify_runtime() -> dict:
    import httpx
    from redis.asyncio import Redis
    from sqlalchemy import inspect, text

    from app.config.setting import settings
    from app.core.database import async_engine
    from app.core.redis_crud import RedisCURD
    from app.init_app import _startup_schema_lock
    from app.scripts.startup_policy import validate_database_schema
    from main import create_app

    async def snapshot() -> dict:
        async with async_engine.connect() as connection:
            tables = await connection.run_sync(lambda sync: sorted(inspect(sync).get_table_names()))
            return {
                table: int((await connection.execute(text(f"SELECT COUNT(*) FROM `{table}`"))).scalar_one())
                for table in tables
            }

    initial = await snapshot()
    assert initial.get("sys_user", 0) > 0
    assert initial.get("alembic_version", 0) > 0
    redis = Redis.from_url(settings.REDIS_URI, decode_responses=True)
    try:
        crud = RedisCURD(redis)
        lease_key = "integration:lease"
        acquired, owner = await crud.lock(lease_key, expire=1, value="first-owner")
        assert acquired
        assert not await crud.renew_lock(lease_key, expire=10, value="other-owner")
        assert not await crud.unlock(lease_key, "other-owner")
        await asyncio.sleep(1.1)
        acquired, replacement = await crud.lock(lease_key, expire=10, value="replacement-owner")
        assert acquired
        assert not await crud.unlock(lease_key, owner)
        assert await crud.renew_lock(lease_key, expire=10, value=replacement)
        assert await crud.unlock(lease_key, replacement)

        entered = asyncio.Event()
        release = asyncio.Event()
        second_entered = asyncio.Event()

        async def first_worker() -> None:
            async with _startup_schema_lock(redis):
                entered.set()
                await release.wait()

        async def second_worker() -> None:
            async with _startup_schema_lock(redis):
                second_entered.set()

        first = asyncio.create_task(first_worker())
        await asyncio.wait_for(entered.wait(), timeout=5)
        second = asyncio.create_task(second_worker())
        try:
            await asyncio.sleep(0.2)
            assert not second_entered.is_set()
        finally:
            release.set()
            await asyncio.wait_for(asyncio.gather(first, second), timeout=5)
        assert second_entered.is_set()
        assert not await redis.exists("fastcore:startup:schema")

        for restart in range(2):
            application = create_app()
            async with application.router.lifespan_context(application):
                transport = httpx.ASGITransport(app=application, client=("127.0.0.1", 10000 + restart))
                async with httpx.AsyncClient(transport=transport, base_url="http://127.0.0.1") as client:
                    response = await client.get("/common/health/ready")
                    assert response.status_code == 200
                    health = response.json()["data"]["dependencies"]
                    assert health["database"]["status"] == 1
                    assert health["redis"]["status"] == 1
                    for _ in range(3):
                        assert (await client.get("/common/health/ready")).status_code == 200
                        assert (await client.get("/common/health/live")).status_code == 200
                    limiter_probe = "/system/auth/captcha/get"
                    assert (await client.get(limiter_probe)).status_code == 200
                    assert (await client.get(limiter_probe)).status_code == 200
                    assert (await client.get(limiter_probe)).status_code == 429
                    await asyncio.sleep(settings.RATE_LIMITER_SECONDS + 0.1)
                    assert (await client.get(limiter_probe)).status_code == 200
            assert await snapshot() == initial, "重复生产启动不得破坏现有结构或基础数据"
            await asyncio.sleep(settings.RATE_LIMITER_SECONDS + 0.1)

        async with async_engine.begin() as connection:
            heads = (await connection.execute(text("SELECT version_num FROM alembic_version"))).scalars().all()
            await connection.execute(text("DELETE FROM alembic_version"))
        try:
            try:
                await validate_database_schema()
            except RuntimeError as error:
                assert "迁移版本" in str(error)
            else:
                raise AssertionError("生产结构检查必须拒绝未部署的迁移版本")
            async with async_engine.connect() as connection:
                assert (await connection.execute(text("SELECT COUNT(*) FROM alembic_version"))).scalar_one() == 0
        finally:
            async with async_engine.begin() as connection:
                for head in heads:
                    await connection.execute(text("INSERT INTO alembic_version (version_num) VALUES (:head)"), {"head": head})
        return {
            "passed": True,
            "database": "disposable MySQL",
            "redis": "real Redis database 15",
            "checks": ["automatic startup migration and initialization", "production restart preserves schema/seed data", "Redis expiry and owner fencing", "startup lock serialization", "configured HTTP limit and expiry", "explicit stale schema rejection"],
        }
    finally:
        await redis.aclose()
        await async_engine.dispose()


def run_child(phase: str) -> None:
    configure_child()
    if phase in {"bootstrap", "upgrade"}:
        from main import fastcore_cli

        fastcore_cli(args=[phase, "--env=prod"])
    elif phase == "empty-schema":
        from main import create_app

        async def auto_initialize() -> None:
            application = create_app()
            async with application.router.lifespan_context(application):
                pass

        asyncio.run(auto_initialize())
    elif phase == "prepare-recovery":
        asyncio.run(prepare_recovery())
    elif phase in {"crash-index", "recover-index"}:
        evidence = asyncio.run(run_recovery_phase(phase == "crash-index"))
        print(json.dumps(evidence))
        (Path(os.environ["FASTCORE_INTEGRATION_ROOT"]) / f"recovered-{os.getpid()}.json").write_text(json.dumps(evidence), encoding="utf-8")
    elif phase in {"prepare-memory", "crash-memory", "recover-memory", "verify-reliability"}:
        from reliability_checks import memory_restart_phase, verify_reliability

        evidence = asyncio.run(verify_reliability() if phase == "verify-reliability" else memory_restart_phase(phase))
        (Path(os.environ["FASTCORE_INTEGRATION_ROOT"]) / f"{phase}-{os.getpid()}.json").write_text(json.dumps(evidence, indent=2), encoding="utf-8")
    else:
        evidence = asyncio.run(verify_runtime())
        (Path(os.environ["FASTCORE_INTEGRATION_ROOT"]) / "runtime-results.json").write_text(json.dumps(evidence, indent=2), encoding="utf-8")


def run(mysql_port: int, redis_port: int, acknowledged: bool) -> Path:
    validate_target(mysql_port, redis_port, acknowledged)
    import pymysql
    from redis import Redis

    redis = Redis(host="127.0.0.1", port=redis_port, db=15, decode_responses=True)
    connection = None
    created = False
    database_name = "fastcore_ci_" + secrets.token_hex(8)
    artifacts = Path(tempfile.mkdtemp(prefix="fastcore-integration-"))
    try:
        redis.ping()
        if redis.dbsize():
            raise ValueError("拒绝非空 Redis DB 15；请提供全新临时实例")
        connection = pymysql.connect(
            host="127.0.0.1",
            port=mysql_port,
            user=os.environ.get("INTEGRATION_MYSQL_USER", "root"),
            password=os.environ.get("INTEGRATION_MYSQL_PASSWORD", ""),
            autocommit=True,
        )
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE `{database_name}` CHARACTER SET utf8mb4")
        created = True
        environment = {
            **os.environ,
            "ENVIRONMENT": "prod",
            "DATABASE_TYPE": "mysql",
            "DATABASE_HOST": "127.0.0.1",
            "DATABASE_PORT": str(mysql_port),
            "DATABASE_USER": os.environ.get("INTEGRATION_MYSQL_USER", "root"),
            "DATABASE_PASSWORD": os.environ.get("INTEGRATION_MYSQL_PASSWORD", ""),
            "DATABASE_NAME": database_name,
            "REDIS_ENABLE": "true",
            "REDIS_HOST": "127.0.0.1",
            "REDIS_PORT": str(redis_port),
            "REDIS_USER": "",
            "REDIS_PASSWORD": "",
            "REDIS_DB_NAME": "15",
            "SECRET_KEY": secrets.token_urlsafe(48),
            "SQL_DB_ENABLE": "true",
            "STATIC_ENABLE": "false",
            "UPLOAD_FILE_PATH": str(artifacts / "uploads"),
            "ROOT_PATH": "",
            "RATE_LIMITER_TIMES": "2",
            "RATE_LIMITER_SECONDS": "2",
            "OPENAI_API_KEY": "",
            "OPENAI_MODEL": "",
            "OPENAI_BASE_URL": "",
            "RETRIEVAL_MODE": "bm25",
            "BM25_TOKENIZER": "char",
            "CHROMA_PERSIST_DIR": str(artifacts / "chroma"),
            "BM25_INDEX_DIR": str(artifacts / "bm25"),
            "LOCAL_EMBEDDING_CACHE_DIR": str(artifacts / "embeddings"),
            "ANONYMIZED_TELEMETRY": "False",
            "FASTCORE_INTEGRATION_ROOT": str(artifacts),
            "PYTHONPATH": os.pathsep.join([str(ROOT / "integration"), str(ROOT)]),
        }
        def run_phase(phase: str) -> None:
            with (artifacts / f"{phase}.log").open("w", encoding="utf-8") as log:
                process = subprocess.run([sys.executable, str(Path(__file__).resolve()), "--phase", phase], cwd=ROOT, env=environment, stdout=log, stderr=log, timeout=180, check=False)
            if process.returncode != 0:
                raise RuntimeError(f"隔离集成 {phase} 失败，诊断日志：{artifacts / f'{phase}.log'}")

        for phase in ["empty-schema", "bootstrap", "upgrade", "verify", "verify-reliability"]:
            run_phase(phase)

        from reliability_checks import verify_memory_process_restart

        memory_restart = verify_memory_process_restart(environment, artifacts, Path(__file__).resolve())
        (artifacts / "memory-restart.json").write_text(json.dumps(memory_restart, indent=2), encoding="utf-8")
        run_phase("prepare-recovery")
        with (artifacts / "crash-index.log").open("w", encoding="utf-8") as log:
            worker = subprocess.Popen([sys.executable, str(Path(__file__).resolve()), "--phase", "crash-index"], cwd=ROOT, env=environment, stdout=log, stderr=log)
            try:
                deadline = time.monotonic() + 60
                while not (artifacts / "index-claimed").exists():
                    if worker.poll() is not None or time.monotonic() >= deadline:
                        raise RuntimeError(f"未到达持久化任务崩溃边界，诊断日志：{artifacts / 'crash-index.log'}")
                    time.sleep(0.1)
                worker.kill()
                assert worker.wait(timeout=5) == -signal.SIGKILL
            finally:
                if worker.poll() is None:
                    worker.kill()
                    worker.wait(timeout=5)
        fixture = json.loads((artifacts / "document.json").read_text(encoding="utf-8"))
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT index_status, index_attempts, index_token FROM `{database_name}`.ai_knowledge_document WHERE id=%s", (fixture["document_id"],))
            status, attempts, token = cursor.fetchone()
            assert status == "indexing" and attempts == 1 and token
        time.sleep(2.2)
        restart_pids = []
        for restart in range(2):
            with (artifacts / f"recover-index-{restart}.log").open("w", encoding="utf-8") as log:
                process = subprocess.Popen([sys.executable, str(Path(__file__).resolve()), "--phase", "recover-index"], cwd=ROOT, env=environment, stdout=log, stderr=log)
                try:
                    assert process.wait(timeout=90) == 0, f"重启恢复失败，诊断日志：{artifacts / f'recover-index-{restart}.log'}"
                finally:
                    if process.poll() is None:
                        process.kill()
                        process.wait(timeout=5)
                restart_pids.append(process.pid)
        assert len({worker.pid, *restart_pids}) == 3
        evidence_file = artifacts / "runtime-results.json"
        evidence = json.loads(evidence_file.read_text(encoding="utf-8"))
        evidence["checks"].append("real process SIGKILL and two production startup/shutdown cycles recover persistent document")
        evidence["restart"] = {"killed_pid": worker.pid, "exit_code": -signal.SIGKILL, "restart_pids": restart_pids}
        evidence["boundary"] = "real MySQL/Redis/production lifecycle/SQL claims/file parsing/BM25; parser pause barrier and 2-second lease only in killed fixture process; BM25 mode, no external model/embedding requests"
        evidence_file.write_text(json.dumps(evidence, indent=2), encoding="utf-8")
        return artifacts
    finally:
        if created and connection is not None:
            with connection.cursor() as cursor:
                cursor.execute(f"DROP DATABASE `{database_name}`")
        if connection is not None:
            connection.close()
        redis.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mysql-port", type=int, default=33306)
    parser.add_argument("--redis-port", type=int, default=36379)
    parser.add_argument("--disposable-services", action="store_true")
    parser.add_argument("--phase", choices=["empty-schema", "bootstrap", "upgrade", "verify", "prepare-recovery", "crash-index", "recover-index",
                                          "verify-reliability", "prepare-memory", "crash-memory", "recover-memory"], help=argparse.SUPPRESS)
    arguments = parser.parse_args()
    if arguments.phase:
        run_child(arguments.phase)
    else:
        print(f"Runtime acceptance passed; evidence: {run(arguments.mysql_port, arguments.redis_port, arguments.disposable_services)}")
