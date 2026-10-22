from __future__ import annotations

import os
import re
import stat
import time
from collections import defaultdict
from pathlib import Path

import anyio
from sqlalchemy import select, update

from app.core.database import async_db_session
from app.core.logger import logger

from .model import KnowledgeBaseModel, KnowledgeDocumentModel

UPLOAD_RECOVERY_DELAY_SECONDS = 3600
_UPLOAD_NAME = re.compile(r"(kb|doc)-([1-9][0-9]*)-[0-9a-f]{32}\.(txt|md|pdf|docx)")


def _scan_uploads(root: Path) -> dict[tuple[str, int], list[tuple[str, os.stat_result]]]:
    candidates = defaultdict(list)
    cutoff = time.time() - UPLOAD_RECOVERY_DELAY_SECONDS
    if root.is_symlink() or not root.is_dir():
        return candidates
    # shortcut: legacy UUID names have no transaction owner; reclaim them only during offline maintenance.
    with os.scandir(root) as entries:
        for entry in entries:
            match = _UPLOAD_NAME.fullmatch(entry.name)
            if match is None:
                continue
            try:
                info = entry.stat(follow_symlinks=False)
            except FileNotFoundError:
                continue
            if stat.S_ISREG(info.st_mode) and info.st_mtime <= cutoff:
                candidates[(match[1], int(match[2]))].append((entry.name, info))
    return candidates


def _referenced_paths(root: Path, rows) -> set[str]:
    references = set()
    for file_path, pending_file, cleanup_paths in rows:
        paths = [file_path, *(cleanup_paths or [])]
        if pending_file:
            paths.append(pending_file["file_path"])
        for path in paths:
            if not path:
                continue
            candidate = Path(path)
            if not candidate.is_absolute():
                candidate = root / candidate
            try:
                references.add(candidate.resolve().relative_to(root).as_posix())
            except ValueError:
                continue
    return references


def _unlink_upload(root: Path, name: str, expected: os.stat_result) -> None:
    # Pin the directory and never follow a replaced directory/file symlink.
    fd = os.open(root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        try:
            current = os.stat(name, dir_fd=fd, follow_symlinks=False)
        except FileNotFoundError:
            return
        if stat.S_ISREG(current.st_mode) and (current.st_dev, current.st_ino, current.st_mtime_ns, current.st_size) == (expected.st_dev, expected.st_ino, expected.st_mtime_ns, expected.st_size):
            os.unlink(name, dir_fd=fd)
    finally:
        os.close(fd)


async def recover_orphan_uploads(root: Path) -> None:
    """Delete only unreferenced uploads after synchronizing with their SQL transaction."""
    candidates = await anyio.to_thread.run_sync(_scan_uploads, root)
    for (kind, owner_id), files in candidates.items():
        try:
            async with async_db_session() as db:
                model = KnowledgeBaseModel if kind == "kb" else KnowledgeDocumentModel
                dialect = db.get_bind().dialect.name
                if dialect == "sqlite":
                    # SQLite ignores FOR UPDATE; a write transaction is the upload barrier.
                    locked = await db.execute(update(model).where(model.id == owner_id).values(updated_time=model.updated_time))
                    if locked.rowcount != 1:
                        continue
                elif dialect in ("mysql", "postgresql"):
                    locked = await db.execute(select(model.id).where(model.id == owner_id).with_for_update(skip_locked=True))
                    if locked.scalar_one_or_none() is None:
                        continue
                else:
                    continue
                # First snapshot read AFTER the barrier, including soft-deleted documents.
                rows = (await db.execute(select(KnowledgeDocumentModel.file_path, KnowledgeDocumentModel.pending_file, KnowledgeDocumentModel.file_cleanup_paths))).all()
                references = await anyio.to_thread.run_sync(_referenced_paths, root.resolve(), rows)
                for name, info in files:
                    if name in references:
                        continue
                    try:
                        await anyio.to_thread.run_sync(_unlink_upload, root, name, info)
                    except OSError:
                        logger.error("清理孤立知识库上传文件失败，等待重试")
                # Closing rolls back the no-op write and releases the barrier after unlink.
        except Exception:
            logger.error("恢复知识库上传文件检查失败，等待重试")
