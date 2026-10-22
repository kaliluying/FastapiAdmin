"""Offline, integrity-checked database and knowledge-store backup CLI."""

import argparse
import hashlib
import json
import os
import shutil
import sqlite3
import stat
import subprocess
import tempfile
import zipfile
from datetime import UTC, datetime
from pathlib import Path, PurePosixPath

STORE_NAMES = {"knowledge", "upload", "chroma", "bm25"}
DATABASE_FILES = {"sqlite": "database.db", "mysql": "database.sql"}


class BackupError(ValueError):
    """A safe operation message which contains no configuration or provider output."""


def _safe_path(path: Path) -> Path:
    path = Path(os.path.abspath(path))
    if any(part.is_symlink() for part in (path, *path.parents)):
        raise BackupError("路径不允许包含符号链接")
    return path


def _digest(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def _copy_file(source: Path, target: Path) -> None:
    if not stat.S_ISREG(source.lstat().st_mode):
        raise BackupError("仅允许普通文件")
    fd = os.open(source, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    with os.fdopen(fd, "rb") as stream:
        if not stat.S_ISREG(os.fstat(stream.fileno()).st_mode):
            raise BackupError("仅允许普通文件")
        with target.open("xb") as output:
            os.chmod(target, 0o600)
            shutil.copyfileobj(stream, output)


def _copy_tree(source: Path, target: Path) -> None:
    _safe_path(source)
    if not source.is_dir():
        raise BackupError("存储源必须是目录")
    target.mkdir(mode=0o700)
    for entry in source.iterdir():
        if entry.is_symlink():
            raise BackupError("存储源不允许符号链接")
        if entry.is_dir():
            _copy_tree(entry, target / entry.name)
        else:
            _copy_file(entry, target / entry.name)


def _run_dump(database: dict, target: Path) -> None:
    kind = database["type"]
    if kind == "sqlite":
        source = _safe_path(Path(database["path"]))
        if not source.is_file():
            raise BackupError("SQLite 源文件不存在")
        with sqlite3.connect(source.as_uri() + "?mode=ro", uri=True) as source_db, sqlite3.connect(target) as target_db:
            source_db.backup(target_db)
            if target_db.execute("PRAGMA integrity_check").fetchone() != ("ok",):
                raise BackupError("SQLite 完整性检查失败")
        os.chmod(target, 0o600)
        return
    binary = shutil.which("mysqldump")
    if not binary:
        raise BackupError("缺少 mysqldump，请先安装与数据库服务版本兼容的客户端")
    # Credentials exist only in a private temporary file, never the manifest or argv.
    with tempfile.TemporaryDirectory(prefix="fastcore-db-auth-") as auth_dir:
        config = Path(auth_dir) / "client.cnf"

        def quote(value: object) -> str:
            return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "\\r") + '"'

        config.write_text("[client]\n" + "\n".join(f"{key}={quote(database[key])}" for key in ("host", "port", "user", "password")), encoding="utf-8")
        os.chmod(config, 0o600)
        args = [binary, f"--defaults-extra-file={config}", "--single-transaction", "--routines", "--events", "--triggers", "--hex-blob", "--no-tablespaces", "--", database["name"]]
        with target.open("xb") as stream:
            os.chmod(target, 0o600)
            result = subprocess.run(args, stdout=stream, stderr=subprocess.PIPE, check=False)
        if result.returncode or target.stat().st_size == 0:
            raise BackupError("mysqldump 备份失败；请检查连接、权限及客户端版本（错误内容已隐藏）")


def create_backup(output: Path, database: dict, stores: dict[str, Path], *, stopped: bool) -> None:
    """Publish a private ZIP only after all stopped-service stores were captured."""
    if not stopped:
        raise BackupError("必须停止所有后端/索引写入，并显式确认 stopped")
    if database.get("type") not in DATABASE_FILES or set(stores) not in ({"upload"}, STORE_NAMES):
        raise BackupError("数据库类型或存储集合不支持")
    output = _safe_path(output)
    if output.exists():
        raise BackupError("备份输出已存在，不允许覆盖")
    if not output.parent.is_dir():
        raise BackupError("备份父目录必须已存在")
    roots = [_safe_path(Path(path)) for path in stores.values()]
    if any(output.is_relative_to(root) for root in roots):
        raise BackupError("备份输出不能位于存储源内")
    with tempfile.TemporaryDirectory(prefix=".backup-", dir=output.parent) as temporary:
        stage = Path(temporary)
        payload = stage / "payload"
        payload.mkdir(mode=0o700)
        db_file = DATABASE_FILES[database["type"]]
        _run_dump(database, payload / db_file)
        present = []
        for name, root in stores.items():
            if root.exists():
                _copy_tree(root, payload / name)
                present.append(name)
        files = {path.relative_to(payload).as_posix(): {"sha256": _digest(path), "size": path.stat().st_size} for path in sorted(payload.rglob("*")) if path.is_file()}
        directories = sorted(path.relative_to(payload).as_posix() for path in payload.rglob("*") if path.is_dir())
        manifest = {
            "version": 1,
            "created_at": datetime.now(UTC).isoformat(),
            "consistency": "writers-stopped",
            "database_type": database["type"],
            "stores": sorted(present),
            "files": files,
            "directories": directories,
        }
        archive = stage / "backup.zip"
        with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, allowZip64=True) as bundle:
            bundle.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False))
            for name in files:
                bundle.write(payload / name, name)
        os.chmod(archive, 0o600)
        verify_backup(archive)
        # Hard-link publication is atomic and fails if another writer reserved the same filename.
        with archive.open("rb") as stream:
            os.fsync(stream.fileno())
        os.link(archive, output)


def _member_name(name: str) -> bool:
    path = PurePosixPath(name)
    return bool(name and "\\" not in name and not path.is_absolute() and name == path.as_posix() and all(part not in {".", ".."} for part in path.parts))


def verify_backup(archive: Path) -> dict:
    """Reject unsafe entries and changed/missing/extra payload before restoration."""
    _safe_path(archive)
    with zipfile.ZipFile(archive) as bundle:
        entries = bundle.infolist()
        names = [entry.filename for entry in entries]
        if len(names) != len(set(names)) or any(not _member_name(entry.filename) or not stat.S_ISREG((entry.external_attr >> 16) | stat.S_IFREG) for entry in entries):
            raise BackupError("备份包含重复、特殊或不安全路径")
        if "manifest.json" not in names or bundle.getinfo("manifest.json").file_size > 16 * 1024 * 1024:
            raise BackupError("备份清单不存在或过大")
        manifest = json.loads(bundle.read("manifest.json"))
        if not isinstance(manifest, dict):
            raise BackupError("备份清单无效")
        if manifest.get("version") != 1 or manifest.get("consistency") != "writers-stopped" or manifest.get("database_type") not in DATABASE_FILES:
            raise BackupError("备份格式不支持")
        files = manifest.get("files")
        directories = manifest.get("directories")
        stores = manifest.get("stores")
        if (
            not isinstance(files, dict)
            or not isinstance(directories, list)
            or not isinstance(stores, list)
            or not all(isinstance(name, str) for name in stores)
            or not set(stores).issubset(STORE_NAMES)
        ):
            raise BackupError("备份清单无效")
        db_file = DATABASE_FILES[manifest["database_type"]]
        if db_file not in files or set(names) != {*files, "manifest.json"}:
            raise BackupError("备份文件集合不匹配")
        for name in [*files, *directories]:
            if not isinstance(name, str) or not _member_name(name) or (name != db_file and PurePosixPath(name).parts[0] not in stores):
                raise BackupError("备份路径无效")
        if set(files) & set(directories) or any(parent.as_posix() in files for name in [*files, *directories] for parent in PurePosixPath(name).parents if parent != PurePosixPath(".")):
            raise BackupError("备份文件与目录冲突")
        for name, expected in files.items():
            if not isinstance(expected, dict) or bundle.getinfo(name).file_size != expected.get("size"):
                raise BackupError("备份文件长度不匹配")
            with bundle.open(name) as stream:
                if hashlib.file_digest(stream, "sha256").hexdigest() != expected.get("sha256"):
                    raise BackupError("备份校验失败")
        return manifest


def restore_backup(archive: Path, target: Path) -> dict:
    """Restore to a new offline directory, never overwrite live data or connect to a DB."""
    manifest = verify_backup(archive)
    target = _safe_path(target)
    if target.exists() or not target.parent.is_dir():
        raise BackupError("恢复目标必须是已存在父目录中的新目录")
    lock = target.parent / f".{target.name}.restore.lock"
    fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o600)
    os.close(fd)
    try:
        with tempfile.TemporaryDirectory(prefix=".restore-", dir=target.parent) as temporary:
            payload = Path(temporary) / "payload"
            payload.mkdir(mode=0o700)
            for name in manifest["directories"]:
                (payload / name).mkdir(parents=True, exist_ok=True, mode=0o700)
            with zipfile.ZipFile(archive) as bundle:
                for name, expected in manifest["files"].items():
                    destination = payload / name
                    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
                    with bundle.open(name) as stream, destination.open("xb") as output:
                        os.chmod(destination, 0o600)
                        shutil.copyfileobj(stream, output)
                    if _digest(destination) != expected["sha256"]:
                        raise BackupError("恢复时内容发生变化")
            if manifest["database_type"] == "sqlite":
                with sqlite3.connect((payload / "database.db").as_uri() + "?mode=ro", uri=True) as connection:
                    if connection.execute("PRAGMA integrity_check").fetchone() != ("ok",):
                        raise BackupError("恢复的 SQLite 完整性检查失败")
            if target.exists():
                raise BackupError("恢复目标已存在，不允许覆盖")
            payload.rename(target)
        return manifest
    finally:
        lock.unlink()


def _project_sources(env: str) -> tuple[dict, dict[str, Path]]:
    os.environ["ENVIRONMENT"] = env
    from app.config.setting import settings
    from app.core.modules import get_modules, resolve_entrypoint

    database = {
        "type": settings.DATABASE_TYPE,
        "host": settings.DATABASE_HOST,
        "port": settings.DATABASE_PORT,
        "user": settings.DATABASE_USER,
        "password": settings.DATABASE_PASSWORD,
        "name": settings.DATABASE_NAME,
    }
    if settings.DATABASE_TYPE == "sqlite":
        database["path"] = Path(f"{settings.DATABASE_NAME}.db")
    stores = {"upload": settings.UPLOAD_FILE_PATH}
    for module in get_modules():
        if module.backup_sources:
            sources = resolve_entrypoint(module.backup_sources)()
            if stores.keys() & sources.keys():
                raise BackupError("模块备份存储名称冲突")
            stores.update(sources)
    return database, stores


def main() -> None:
    parser = argparse.ArgumentParser(description="FastCore 离线备份、完整性校验和安全恢复")
    commands = parser.add_subparsers(dest="command", required=True)
    create = commands.add_parser("create")
    create.add_argument("--env", choices=("dev", "prod"), required=True)
    create.add_argument("--output", type=Path, required=True)
    create.add_argument("--writers-stopped", action="store_true", help="确认所有应用和索引写入已停止")
    verify = commands.add_parser("verify")
    verify.add_argument("archive", type=Path)
    restore = commands.add_parser("restore")
    restore.add_argument("archive", type=Path)
    restore.add_argument("--target", type=Path, required=True, help="新的离线恢复目录")
    args = parser.parse_args()
    try:
        if args.command == "create":
            if not args.writers_stopped:
                raise BackupError("请停写后添加 --writers-stopped")
            database, stores = _project_sources(args.env)
            create_backup(args.output, database, stores, stopped=True)
        elif args.command == "verify":
            verify_backup(args.archive)
        else:
            restore_backup(args.archive, args.target)
    except (OSError, ValueError, sqlite3.Error, zipfile.BadZipFile, KeyError, TypeError) as exc:
        # Do not print provider errors or configuration objects which may contain credentials.
        parser.exit(1, f"操作失败：{exc if isinstance(exc, BackupError) else type(exc).__name__}\n")
    print("操作完成；未连接恢复目标数据库。" if args.command == "restore" else "操作完成。")


if __name__ == "__main__":
    main()
