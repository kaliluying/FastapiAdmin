"""管理员运行日志的独立只读查询，覆盖活动文件和 Loguru 轮转归档。

安全打开固定日志目录内的普通文件，按文件大小快照逐行读取；不跟随软链接。
完整记录先脱敏再匹配，在扫描预算内返回匹配条目及完整堆栈。
并发写入的未完成记录与无法识别的内容通过 truncated 标明，不能证明全局无故障。
自动脱敏并非绝对保证，输出仍应视为敏感数据。
"""
import asyncio
import gzip
import hashlib
import io
import ipaddress
import os
import re
import stat
import zlib
from collections.abc import Iterator
from contextlib import closing
from datetime import datetime, timedelta
from threading import Event
from typing import TYPE_CHECKING, BinaryIO, Literal, get_args

from pydantic import BaseModel, ConfigDict, Field

from app.config.path_conf import LOG_DIR
from app.core.exceptions import CustomException
from app.core.logger import logger

if TYPE_CHECKING:
    from app.core.base_schema import AuthSchema

LogLevel = Literal["DEBUG", "INFO", "SUCCESS", "WARNING", "ERROR", "CRITICAL"]
_REDACTED = "[REDACTED]"
_NOTICE = (
    "仅本实例 fastcore.log 完整活动文件及轮转归档，非全局日志。"
    "使用服务器本地时间；并发写入的多行 trace 可能不完整。"
    "完整 CID 按日志前 8 位兼容匹配，可能碰撞。"
    "自动脱敏非绝对保证，输出仍可能包含敏感信息。"
    "扫描受文件数、字节数、单条记录和匹配数预算限制，truncated=true 时证据不完整。"
)
MAX_QUERY_MINUTES = 7 * 24 * 60
MAX_SCAN_BYTES = 64 * 1024 * 1024
MAX_SCAN_FILES = 64
MAX_RECORD_BYTES = 4 * 1024 * 1024
MAX_MATCHED_ENTRIES = 100
MAX_MATCHED_BYTES = 8 * 1024 * 1024
_HEADER = re.compile(
    rb"^(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})"
    rb" \|\s*(?P<level>DEBUG|INFO|SUCCESS|WARNING|ERROR|CRITICAL)\s*\| "
    rb"(?P<source>[^\r\n]+?) - (?P<message>[^\r\n]*)\r?\n",
    re.MULTILINE,
)
_CID = re.compile(r"(?:\|\s*cid|\bcorrelation_id)\s*[:=]\s*([A-Za-z0-9_-]{1,64})(?=$|\s|[,}\]])")
_PRIVATE_KEY = re.compile(r"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----.*?(?:-----END [A-Z0-9 ]*PRIVATE KEY-----|\Z)", re.DOTALL)
_TRACE_VALUES = re.compile(r"(?m)^[ \t]*[│┃┆┇╎╏└┗├┣╰┌┏].*$")
_URL_CREDENTIALS = re.compile(r"(?i)\b[a-z][a-z0-9+.-]{0,31}://[^\s/'\"<>]+@[^\s'\"<>]+")
_QUOTED_VALUE = r""""(?:\\[\s\S]|[^"\\])*(?:"|\\?\Z)|'(?:\\[\s\S]|[^'\\])*(?:'|\\?\Z)"""
_HEADERS = re.compile(
    r"""(?im)(["']?\b(?:authorization|proxy-authorization|cookies?|set-cookie)["']?\s*[:=]\s*)"""
    + "(?:" + _QUOTED_VALUE + r"|[^\r\n]+)"
)
_SECRET_VALUES = re.compile(
    r"""(?i)(["']?(?<![\w.-])(?=[\w.-]*(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?key|token|credential|cookie|session))"""
    r"""[\w.-]++["']?\s*[:=]\s*)"""
    + "(?:" + _QUOTED_VALUE + r"|\{[^\r\n]*\}|\[[^\r\n]*\]|[^\s,;}\]]+)"
)
_AUTH_TOKEN = re.compile(r"(?i)\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/-]+=*")
_JWT = re.compile(r"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b")
_KNOWN_TOKEN = re.compile(r"\b(?:sk-[A-Za-z0-9_-]{8,}|gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|xox[baprs]-[A-Za-z0-9-]+)\b")
_EMAIL = re.compile(r"(?i)(?<![A-Z0-9._%+-])[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]{1,253}\.[A-Z]{2,63}\b")
_IP = re.compile(r"(?<![\w:])\d{1,3}(?:\.\d{1,3}){3}(?!\w)|(?<![\w:])(?:[0-9a-fA-F]{0,4}:){2,}[0-9a-fA-F:.]*(?:%[\w.-]+)?(?![\w:])")
_MOBILE = re.compile(r"(?<!\w)(?:\+?\d[\d ()-]{7,}\d)(?!\w)")


class RuntimeLogQuerySchema(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    minutes: int = Field(default=60, ge=1, le=MAX_QUERY_MINUTES)
    levels: list[LogLevel] = Field(default_factory=lambda: list(get_args(LogLevel)), min_length=1, max_length=6)
    keyword: str = Field(default="", max_length=2_000)
    correlation_id: str = Field(default="", max_length=64, pattern=r"^[A-Za-z0-9_-]*$")


RUNTIME_LOG_TOOL = {
    "type": "function",
    "function": {
        "name": "query_runtime_logs",
        "description": "只读查询当前后台实例的运行/报错日志，排查后台错误、异常、超时。覆盖活动文件和轮转归档，不含其他实例。参数为最近分钟数、级别、脱敏后忽略大小写的字面关键词、请求ID；不接受路径、SQL或命令。默认最近60分钟的所有级别，在扫描预算内返回完整匹配记录；超出预算会标记 truncated=true。可按请求ID查全级别上下文，或缩小时间与关键词继续查询。",
        "parameters": RuntimeLogQuerySchema.model_json_schema(),
    },
}


def redact_log_text(text: str) -> str:
    """整段脱敏；启发式规则不能保证清除任意秘密。"""
    text = _PRIVATE_KEY.sub(_REDACTED, text)
    text = _TRACE_VALUES.sub(_REDACTED, text)
    text = _URL_CREDENTIALS.sub(_REDACTED, text)
    text = _HEADERS.sub(lambda match: match[1] + _REDACTED, text)
    text = _SECRET_VALUES.sub(lambda match: match[1] + _REDACTED, text)
    text = _AUTH_TOKEN.sub(_REDACTED, text)
    text = _JWT.sub(_REDACTED, text)
    text = _KNOWN_TOKEN.sub(_REDACTED, text)
    text = _EMAIL.sub(_REDACTED, text)

    def redact_ip(match: re.Match) -> str:
        address = match[0].rstrip(".")
        try:
            ipaddress.ip_address(address)
        except ValueError:
            return match[0]
        return _REDACTED + match[0][len(address) :]

    text = _IP.sub(redact_ip, text)
    return _MOBILE.sub(_REDACTED, text)


_ARCHIVE_SUFFIX = r"\.\d{4}-\d{2}-\d{2}(?:_\d{2}-\d{2}-\d{2}_\d+)?(?:\.\d+)?"
_LOG_FILENAME = re.compile(rf"fastcore(?:{_ARCHIVE_SUFFIX})*\.log(?:\.gz)?")


class _SnapshotReader(io.RawIOBase):
    def __init__(self, descriptor: int, size: int, cancelled: Event):
        self.descriptor = descriptor
        self.remaining = size
        self.cancelled = cancelled

    def readable(self) -> bool:
        return True

    def readinto(self, buffer) -> int:
        if self.cancelled.is_set():
            raise InterruptedError("Log query cancelled")
        if not self.remaining:
            return 0
        chunk = os.read(self.descriptor, min(len(buffer), self.remaining, 64 * 1024))
        if not chunk:
            raise OSError("Log snapshot shortened")
        buffer[:len(chunk)] = chunk
        self.remaining -= len(chunk)
        return len(chunk)


def _read_snapshot(cancelled: Event) -> Iterator[tuple[str, tuple[int, int], int, BinaryIO]]:
    if not all(hasattr(os, flag) for flag in ("O_NOFOLLOW", "O_NONBLOCK")) or os.open not in os.supports_dir_fd:
        raise OSError("Secure log access unavailable")
    flags = os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK | getattr(os, "O_BINARY", 0)
    try:
        directory_stat = os.lstat(LOG_DIR)
    except FileNotFoundError:
        return
    if not stat.S_ISDIR(directory_stat.st_mode):
        raise OSError("Invalid log directory")
    directory_fd = os.open(LOG_DIR, flags | getattr(os, "O_DIRECTORY", 0))
    try:
        opened_directory = os.fstat(directory_fd)
        if (directory_stat.st_dev, directory_stat.st_ino) != (opened_directory.st_dev, opened_directory.st_ino):
            raise OSError("Log directory changed")
        filenames = sorted(name for name in os.listdir(directory_fd) if _LOG_FILENAME.fullmatch(name))
        for filename in filenames:
            file_stat = os.stat(filename, dir_fd=directory_fd, follow_symlinks=False)
            if not stat.S_ISREG(file_stat.st_mode):
                raise OSError("Invalid log file")
            file_fd = os.open(filename, flags, dir_fd=directory_fd)
            try:
                snapshot_stat = os.fstat(file_fd)
                identity = (snapshot_stat.st_dev, snapshot_stat.st_ino)
                if not stat.S_ISREG(snapshot_stat.st_mode) or identity != (file_stat.st_dev, file_stat.st_ino):
                    raise OSError("Log file changed")
                with io.BufferedReader(_SnapshotReader(file_fd, snapshot_stat.st_size, cancelled)) as buffer:
                    stream = gzip.GzipFile(fileobj=buffer) if filename.endswith(".gz") else buffer
                    with stream:
                        yield filename, identity, snapshot_stat.st_size, stream
                if os.fstat(file_fd).st_size < snapshot_stat.st_size:
                    raise OSError("Log snapshot shortened")
            finally:
                os.close(file_fd)
    finally:
        os.close(directory_fd)


def _matching_entry(record: bytes, identity: tuple[int, int], offset: int, filename: str, query: RuntimeLogQuerySchema, start_time: datetime, end_time: datetime) -> dict | None:
    header = _HEADER.match(record)
    if header is None:
        return None
    try:
        timestamp = datetime.strptime(header["timestamp"].decode("ascii"), "%Y-%m-%d %H:%M:%S.%f")
    except ValueError:
        return None
    level = header["level"].decode("ascii")
    if not start_time <= timestamp <= end_time or level not in query.levels:
        return None
    raw_message = record[header.start("message"):].decode("utf-8", errors="replace").rstrip()
    cid_matches = list(_CID.finditer(raw_message))
    correlation_id = redact_log_text(cid_matches[-1][1]) if cid_matches else ""
    if not re.fullmatch(r"[A-Za-z0-9_-]{0,64}", correlation_id):
        correlation_id = ""
    if query.correlation_id and not (correlation_id == query.correlation_id or (len(correlation_id) == 8 and len(query.correlation_id) > 8 and correlation_id == query.correlation_id[:8])):
        return None
    source = header["source"].decode("utf-8", errors="replace")
    message = redact_log_text(f"{source} - {raw_message}")
    if query.keyword.casefold() not in message.casefold():
        return None
    return {
        "id": hashlib.sha256(f"{identity[0]}:{identity[1]}:{offset}:".encode() + record).hexdigest()[:32],
        "timestamp": timestamp.isoformat(timespec="milliseconds"),
        "level": level,
        "correlation_id": correlation_id,
        "file": filename,
        "message": message,
    }


def _query_snapshot(query: RuntimeLogQuerySchema, start_time: datetime, end_time: datetime, cancelled: Event) -> dict:
    result = {
        "source": "fastcore.log",
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "scanned_bytes": 0,
        "scanned_files": [],
        "matched_count": 0,
        "truncated": False,
        "notice": _NOTICE,
        "entries": [],
    }
    matched = []
    matched_bytes = 0
    expanded_bytes = 0
    budget_exhausted = False
    saw_candidate_file = False
    with closing(_read_snapshot(cancelled)) as snapshots:
        for filename, identity, size, stream in snapshots:
            saw_candidate_file = True
            if len(result["scanned_files"]) >= MAX_SCAN_FILES or result["scanned_bytes"] + size > MAX_SCAN_BYTES:
                result["truncated"] = True
                break
            result["scanned_files"].append(filename)
            result["scanned_bytes"] += size
            record = bytearray()
            record_offset = 0
            offset = 0
            complete = True
            skip_record = False
            while True:
                line = stream.readline(MAX_RECORD_BYTES + 1)
                if not line:
                    break
                if cancelled.is_set():
                    return result
                expanded_bytes += len(line)
                if expanded_bytes > MAX_SCAN_BYTES:
                    result["truncated"] = True
                    budget_exhausted = True
                    break
                line_complete = line.endswith(b"\n")
                if skip_record:
                    if line_complete:
                        skip_record = False
                    offset += len(line)
                    continue
                is_header = _HEADER.match(line if line_complete else line + b"\n")
                if is_header:
                    if record:
                        entry = _matching_entry(bytes(record), identity, record_offset, filename, query, start_time, end_time)
                        if entry is not None:
                            entry_size = len(record)
                            if len(matched) >= MAX_MATCHED_ENTRIES or matched_bytes + entry_size > MAX_MATCHED_BYTES:
                                result["truncated"] = True
                                budget_exhausted = True
                                break
                            matched.append((entry["timestamp"], filename, record_offset, entry))
                            matched_bytes += entry_size
                    if len(line) > MAX_RECORD_BYTES:
                        result["truncated"] = True
                        record.clear()
                        skip_record = not line_complete
                    else:
                        record = bytearray(line)
                        record_offset = offset
                        complete = line_complete
                elif len(line) > MAX_RECORD_BYTES:
                    result["truncated"] = True
                    record.clear()
                    skip_record = not line_complete
                elif record:
                    record.extend(line)
                    complete = line_complete
                    if len(record) > MAX_RECORD_BYTES:
                        result["truncated"] = True
                        record.clear()
                        skip_record = not line_complete
                else:
                    result["truncated"] = True
                offset += len(line)
            if budget_exhausted:
                break
            if record and complete and not skip_record:
                entry = _matching_entry(bytes(record), identity, record_offset, filename, query, start_time, end_time)
                if entry is not None:
                    entry_size = len(record)
                    if len(matched) >= MAX_MATCHED_ENTRIES or matched_bytes + entry_size > MAX_MATCHED_BYTES:
                        result["truncated"] = True
                        budget_exhausted = True
                        break
                    matched.append((entry["timestamp"], filename, record_offset, entry))
                    matched_bytes += entry_size
            elif record or skip_record:
                result["truncated"] = True
            if budget_exhausted:
                break
    if not result["scanned_files"] and not saw_candidate_file:
        result["notice"] += " 当前活动日志文件与轮转归档不存在。"
    result["entries"] = [item[3] for item in sorted(matched, key=lambda item: item[:3], reverse=True)]
    result["matched_count"] = len(result["entries"])
    return result


async def query_runtime_logs(auth: "AuthSchema", query: RuntimeLogQuerySchema) -> dict:
    """严格检查传入的超级管理员快照；实时用户和登录会话复查由集成方负责。"""
    user = getattr(auth, "user", None)
    if getattr(user, "is_superuser", None) is not True:
        raise CustomException(msg="仅超级管理员可查询运行日志", status_code=403)
    end_time = datetime.now()
    try:
        start_time = end_time - timedelta(minutes=query.minutes)
    except OverflowError:
        start_time = datetime.min
    cancelled = Event()
    try:
        result = await asyncio.to_thread(_query_snapshot, query, start_time, end_time, cancelled)
    except asyncio.CancelledError:
        cancelled.set()
        raise
    except (OSError, EOFError, zlib.error):
        raise CustomException(msg="运行日志暂时无法读取", status_code=503) from None
    admin_id = getattr(user, "id", None)
    if type(admin_id) is not int:
        admin_id = None
    logger.info(
        "Runtime log query admin_id={} scanned_bytes={} matched_count={} returned_count={}",
        admin_id,
        result["scanned_bytes"],
        result["matched_count"],
        len(result["entries"]),
    )
    return result
