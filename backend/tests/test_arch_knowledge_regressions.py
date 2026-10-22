import asyncio
import io
import socket
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import BackgroundTasks, UploadFile

from app.core.exceptions import CustomException
from app.plugin.module_ai import config
from app.plugin.module_ai.chat import capabilities, model_config_service
from app.plugin.module_ai.chat.schema import AiModelConfigUpdateSchema
from app.plugin.module_ai.knowledge import bm25_index, chroma_store, embedding, retrieval
from app.plugin.module_ai.knowledge import service as knowledge


@pytest.fixture
def upload_case(monkeypatch, tmp_path):
    monkeypatch.setattr(knowledge, "UPLOAD_DIR", tmp_path)
    old = tmp_path / "old.txt"
    old.write_text("original")
    previous = tmp_path / "previous.txt"
    previous.write_text("previous replacement")
    document = SimpleNamespace(
        id=7,
        file_path=old.name,
        pending_file={"file_path": previous.name},
        file_cleanup_paths=["retired.txt"],
    )
    db = SimpleNamespace(
        execute=AsyncMock(return_value=SimpleNamespace(rowcount=1)),
        commit=AsyncMock(),
        rollback=AsyncMock(),
        refresh=AsyncMock(),
    )
    crud = SimpleNamespace(
        get_or_404=AsyncMock(return_value=document),
        create_document=AsyncMock(return_value=document),
    )
    monkeypatch.setattr(knowledge, "KnowledgeDocumentCRUD", lambda _auth: crud)
    monkeypatch.setattr(knowledge, "KnowledgeBaseCRUD", lambda _auth: crud)
    service = knowledge.KnowledgeService(SimpleNamespace(db=db, user=SimpleNamespace(id=1)))
    monkeypatch.setattr(service, "_document_output", lambda _doc: document)

    async def invoke(operation):
        file = UploadFile(filename="new.txt", file=io.BytesIO(b"replacement"))
        if operation == "upload":
            return await service.upload_document(knowledge_base_id=1, file=file, background_tasks=BackgroundTasks())
        return await service.replace_document(document.id, file, BackgroundTasks())

    return SimpleNamespace(
        db=db, crud=crud, document=document, service=service,
        old=old, previous=previous, root=tmp_path, invoke=invoke,
    )


@pytest.mark.parametrize("operation", ["upload", "replace"])
@pytest.mark.parametrize("failure", [RuntimeError, asyncio.CancelledError])
async def test_uncommitted_upload_is_removed_on_sql_failure_or_cancellation(upload_case, operation, failure):
    case = upload_case
    if operation == "upload":
        case.crud.create_document.side_effect = failure()
    else:
        case.db.execute.side_effect = failure()
    with pytest.raises(failure):
        await case.invoke(operation)
    assert {path.name for path in case.root.iterdir()} == {"old.txt", "previous.txt"}
    assert case.old.read_text() == "original"
    case.db.commit.assert_not_awaited()
    case.db.rollback.assert_awaited_once()


@pytest.mark.parametrize("operation", ["upload", "replace"])
@pytest.mark.parametrize("failure", [RuntimeError, asyncio.CancelledError])
async def test_uncertain_commit_preserves_new_and_old_originals(upload_case, operation, failure):
    case = upload_case
    case.db.commit.side_effect = failure()
    with pytest.raises(failure):
        await case.invoke(operation)
    assert len(list(case.root.iterdir())) == 3
    assert case.old.read_text() == "original"
    assert case.previous.read_text() == "previous replacement"


async def test_replace_conflict_removes_only_new_file_even_if_rollback_fails(upload_case):
    case = upload_case
    case.db.execute.return_value.rowcount = 0
    case.db.rollback.side_effect = RuntimeError("rollback disconnected")
    with pytest.raises(CustomException) as error:
        await case.invoke("replace")
    assert error.value.status_code == 409
    assert {path.name for path in case.root.iterdir()} == {"old.txt", "previous.txt"}


async def test_refresh_failure_after_commit_preserves_new_file(upload_case):
    case = upload_case
    case.db.refresh.side_effect = RuntimeError("refresh failed")
    with pytest.raises(RuntimeError, match="refresh failed"):
        await case.invoke("replace")
    assert len(list(case.root.iterdir())) == 3
    case.db.commit.assert_awaited_once()


@pytest.mark.parametrize("operation", ["upload", "replace"])
@pytest.mark.parametrize("during_commit", [False, True])
async def test_task_cancellation_respects_the_file_commit_boundary(upload_case, operation, during_commit):
    case = upload_case
    started = asyncio.Event()

    async def wait_for_cancel(*_args, **_kwargs):
        started.set()
        await asyncio.Event().wait()

    if during_commit:
        case.db.commit.side_effect = wait_for_cancel
    elif operation == "upload":
        case.crud.create_document.side_effect = wait_for_cancel
    else:
        case.db.execute.side_effect = wait_for_cancel
    task = asyncio.create_task(case.invoke(operation))
    await asyncio.wait_for(started.wait(), timeout=2)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert len(list(case.root.iterdir())) == (3 if during_commit else 2)
    assert case.old.read_text() == "original"
    assert case.previous.read_text() == "previous replacement"


@pytest.mark.parametrize("operation", ["upload", "replace"])
async def test_metadata_failure_after_saving_removes_the_new_file(upload_case, monkeypatch, operation):
    case = upload_case

    def bad_metadata(_path):
        raise RuntimeError("metadata failed")

    monkeypatch.setattr(case.service, "_safe_knowledge_path", bad_metadata)
    with pytest.raises(RuntimeError, match="metadata failed"):
        await case.invoke(operation)
    assert {path.name for path in case.root.iterdir()} == {"old.txt", "previous.txt"}
    case.db.commit.assert_not_awaited()


@pytest.mark.parametrize("mode", ["vector", "bm25", "hybrid"])
async def test_retrieval_initializes_clients_off_event_loop(monkeypatch, mode):
    loop_thread = threading.get_ident()
    seen = []
    clients = {
        "embedding": SimpleNamespace(embed_texts=AsyncMock(return_value=[[0.1]])),
        "chroma": SimpleNamespace(query=AsyncMock(return_value={"ids": [[]]})),
        "bm25": SimpleNamespace(search=AsyncMock(return_value=[])),
    }

    def getter(name):
        def load():
            seen.append((name, threading.get_ident()))
            return clients[name]
        return load

    monkeypatch.setattr(retrieval, "get_cached_embedding_client", getter("embedding"))
    monkeypatch.setattr(retrieval, "get_cached_chroma_store", getter("chroma"))
    monkeypatch.setattr(retrieval, "get_cached_bm25_index", getter("bm25"))
    retriever = retrieval.KnowledgeRetriever(mode=mode, auto_adjust_alpha=False)
    assert await retriever.search(query="text", knowledge_base_ids=[1]) == []
    assert seen and all(thread != loop_thread for _, thread in seen)
    assert {name for name, _ in seen} == (
        {"embedding", "chroma"} if mode == "vector" else {"bm25"} if mode == "bm25" else set(clients)
    )


async def test_index_cleanup_preserves_sync_getter_overrides_off_event_loop(monkeypatch):
    loop_thread = threading.get_ident()
    seen = []
    store = SimpleNamespace(delete_chunks=AsyncMock())
    bm25 = SimpleNamespace(delete_chunks=AsyncMock())

    def store_getter(_self):
        seen.append(threading.get_ident())
        return store

    def bm25_getter(_self):
        seen.append(threading.get_ident())
        return bm25

    monkeypatch.setattr(knowledge.KnowledgeService, "_get_store", store_getter)
    monkeypatch.setattr(knowledge.KnowledgeService, "_get_bm25_index", bm25_getter)
    await knowledge.KnowledgeService(SimpleNamespace())._delete_index_chunks(["old-generation"], vector=True, bm25=True)
    assert len(seen) == 2 and all(thread != loop_thread for thread in seen)
    store.delete_chunks.assert_awaited_once_with(["old-generation"])
    bm25.delete_chunks.assert_awaited_once_with(["old-generation"])


@pytest.mark.parametrize("kind", ["embedding", "chroma", "bm25"])
def test_concurrent_first_getter_constructs_one_client(monkeypatch, tmp_path, kind):
    count = []
    gate = threading.Barrier(8)

    def construct(*_args, **_kwargs):
        count.append(1)
        time.sleep(0.03)
        return object()

    if kind == "embedding":
        module, constructor = embedding, "create_embedding_client"
        monkeypatch.setattr(embedding.settings, "LOCAL_EMBEDDING_MODEL", str(tmp_path))
        getter = embedding.get_cached_embedding_client
        cache = embedding._cached_embedding_client
    elif kind == "chroma":
        module, constructor = chroma_store, "ChromaKnowledgeStore"
        getter = partial(chroma_store.get_cached_chroma_store, str(tmp_path))
        cache = getattr(chroma_store, "_cached_chroma_store", chroma_store.get_cached_chroma_store)
    else:
        module, constructor = bm25_index, "BM25KnowledgeIndex"
        getter = partial(bm25_index.get_cached_bm25_index, str(tmp_path))
        cache = getattr(bm25_index, "_cached_bm25_index", bm25_index.get_cached_bm25_index)
    monkeypatch.setattr(module, constructor, construct)

    def get():
        gate.wait(timeout=5)
        return getter()

    try:
        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda _index: get(), range(8)))
        assert len(count) == 1
        assert all(client is results[0] for client in results)
    finally:
        cache.cache_clear()


def test_concurrent_bm25_lazy_index_initialization(monkeypatch, tmp_path):
    bm25 = bm25_index.BM25KnowledgeIndex(index_dir=str(tmp_path), tokenizer="char")
    gate = threading.Barrier(8)
    created = []
    monkeypatch.setattr(bm25_index.index, "exists_in", lambda _path: False)

    def create(*_args):
        created.append(1)
        time.sleep(0.03)
        return SimpleNamespace(close=lambda: None)

    monkeypatch.setattr(bm25_index.index, "create_in", create)

    def get(_index):
        gate.wait(timeout=5)
        return bm25._get_index()

    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(get, range(8)))
    assert len(created) == 1
    assert all(result is results[0] for result in results)


@pytest.mark.parametrize("entry", ["update", "list", "capabilities"])
async def test_async_model_entry_points_resolve_dns_off_event_loop(monkeypatch, entry):
    loop_thread = threading.get_ident()
    seen = []
    monkeypatch.setattr(config.settings, "MODEL_ALLOWED_HOSTS", [])
    current = model_config_service.ChatModelRuntimeConfig("openai", "https://old.example/v1", "fixture", "synthetic")
    monkeypatch.setattr(model_config_service, "_active_config", current)
    monkeypatch.setattr(model_config_service, "_find_record", AsyncMock(return_value=None))
    monkeypatch.setattr(model_config_service, "load_runtime_chat_model_config", AsyncMock(return_value=current))
    monkeypatch.setattr(capabilities, "load_runtime_chat_model_config", AsyncMock(return_value=current))

    def resolve(*_args, **_kwargs):
        seen.append(threading.get_ident())
        return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("127.0.0.1", 0))]

    monkeypatch.setattr(config.socket, "getaddrinfo", resolve)
    data = AiModelConfigUpdateSchema(openai_base_url="https://new.example/v1", openai_model="fixture", openai_api_key="synthetic")
    auth = SimpleNamespace(db=SimpleNamespace(), user=SimpleNamespace(id=1))
    invoke = {
        "update": model_config_service.update_model_config,
        "list": model_config_service.list_provider_models,
        "capabilities": capabilities.check_model_capabilities,
    }[entry]
    with pytest.raises(ValueError, match="本机或内网"):
        await invoke(auth, data)
    assert seen and all(thread != loop_thread for thread in seen)


@pytest.mark.parametrize("addresses", [["93.184.216.34"], ["127.0.0.1"], ["93.184.216.34", "10.0.0.1"], []])
async def test_async_url_validator_preserves_dns_ssrf_policy(monkeypatch, addresses):
    monkeypatch.setattr(config.settings, "MODEL_ALLOWED_HOSTS", [])
    def resolve(*_args, **_kwargs):
        return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", (ip, 0)) for ip in addresses]
    monkeypatch.setattr(config.socket, "getaddrinfo", resolve)
    validate = getattr(config, "async_validate_model_base_url", None)
    assert callable(validate), "DNS-aware async validator is missing"
    if addresses == ["93.184.216.34"]:
        assert await validate(" https://provider.example/v1/ ") == "https://provider.example/v1"
    else:
        with pytest.raises(ValueError, match="本机或内网"):
            await validate("https://provider.example/v1")


async def test_schema_validation_and_no_dns_option_never_resolve(monkeypatch):
    monkeypatch.setattr(config.settings, "MODEL_ALLOWED_HOSTS", [])

    def unexpected_dns(*_args, **_kwargs):
        raise AssertionError("schema parsing must not resolve DNS")

    monkeypatch.setattr(config.socket, "getaddrinfo", unexpected_dns)
    data = AiModelConfigUpdateSchema(openai_base_url="https://provider.example/v1/", openai_model="fixture")
    validate = getattr(config, "async_validate_model_base_url", None)
    assert callable(validate), "DNS-aware async validator is missing"
    assert await validate(data.openai_base_url, resolve_dns=False) == "https://provider.example/v1"
