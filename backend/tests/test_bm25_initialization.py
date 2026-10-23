"""Regression checks for process-safe lazy Whoosh initialization."""

import asyncio
import multiprocessing
from unittest.mock import patch

import pytest
from whoosh import index
from whoosh.filedb.filestore import FileStorage

from app.plugin.module_ai.knowledge import bm25_index


def _initialize_and_commit(index_dir, chunk_id, first_missing, contender_progress):
    bm25 = bm25_index.BM25KnowledgeIndex(index_dir=index_dir, tokenizer="char")
    exists_in = index.exists_in
    storage_lock = FileStorage.lock

    def checked_exists(path):
        exists = exists_in(path)
        if chunk_id == "first" and not exists:
            first_missing.set()
            assert contender_progress.wait(15), "Contender did not reach initialization"
        return exists

    def observed_lock(storage, name):
        lock = storage_lock(storage, name)
        acquire = lock.acquire

        def observed_acquire(*args, **kwargs):
            acquired = acquire(*args, **kwargs)
            if chunk_id == "second" and name == "BM25_INITLOCK" and not contender_progress.is_set():
                assert not acquired, "First initializer must still hold the lock"
                contender_progress.set()
            return acquired

        lock.acquire = observed_acquire
        return lock

    with patch.object(index, "exists_in", checked_exists), patch.object(FileStorage, "lock", observed_lock):
        asyncio.run(
            bm25.add_chunks(
                [
                    {
                        "id": chunk_id,
                        "content": f"committed {chunk_id}",
                        "knowledge_base_id": 1,
                        "document_id": 1 if chunk_id == "first" else 2,
                    }
                ]
            )
        )
        if chunk_id == "second":
            # Without an initialization lock, let the delayed creator erase this commit.
            contender_progress.set()


def test_concurrent_first_initialization_preserves_both_commits(tmp_path):
    ctx = multiprocessing.get_context("spawn")
    first_missing = ctx.Event()
    contender_progress = ctx.Event()
    first = ctx.Process(target=_initialize_and_commit, args=(str(tmp_path), "first", first_missing, contender_progress))
    second = ctx.Process(target=_initialize_and_commit, args=(str(tmp_path), "second", first_missing, contender_progress))
    started = []
    try:
        first.start()
        started.append(first)
        assert first_missing.wait(15), "First process did not observe the missing index"
        second.start()
        started.append(second)
        for process in started:
            process.join(20)
            assert process.exitcode == 0, f"Initialization worker failed or hung: {process.exitcode}"

        with index.open_dir(str(tmp_path)).searcher() as searcher:
            assert {doc["chunk_id"] for doc in searcher.all_stored_fields()} == {"first", "second"}
    finally:
        for process in started:
            if process.is_alive():
                process.terminate()
            process.join(5)
            process.close()


def test_initialization_lock_timeout_can_be_retried(monkeypatch, tmp_path):
    bm25 = bm25_index.BM25KnowledgeIndex(index_dir=str(tmp_path), tokenizer="char")
    held_lock = FileStorage(str(tmp_path)).lock("BM25_INITLOCK")
    assert held_lock.acquire()
    try_for = bm25_index.try_for

    def try_once(acquire, *, timeout):
        assert timeout == 10
        return try_for(acquire, timeout=0)

    with monkeypatch.context() as context:
        context.setattr(bm25_index, "try_for", try_once)
        try:
            with pytest.raises(index.LockError, match="BM25 index initialization"):
                bm25._get_index()
            assert bm25._index is None
            assert not index.exists_in(str(tmp_path))
        finally:
            held_lock.release()

    assert bm25._get_index() is bm25._get_index()
    assert index.exists_in(str(tmp_path))


@pytest.mark.parametrize("operation", ["exists_in", "create_in", "open_dir"])
def test_failed_initialization_releases_lock_and_can_be_retried(monkeypatch, tmp_path, operation):
    bm25 = bm25_index.BM25KnowledgeIndex(index_dir=str(tmp_path), tokenizer="char")
    if operation == "open_dir":
        index.create_in(str(tmp_path), bm25.schema).close()

    def fail(*_args):
        raise OSError("initialization failed")

    with monkeypatch.context() as context:
        if operation == "open_dir":
            context.setattr(index, "exists_in", lambda _path: True)
        context.setattr(index, operation, fail)
        with pytest.raises(OSError, match="initialization failed"):
            bm25._get_index()
        assert bm25._index is None

    probe = FileStorage(str(tmp_path)).lock("BM25_INITLOCK")
    assert probe.acquire(), "Initialization failure leaked the lock"
    probe.release()
    assert bm25._get_index() is bm25._get_index()
    assert index.exists_in(str(tmp_path))
