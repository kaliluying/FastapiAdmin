"""在停写后的临时数据库验证原生备份、文件恢复与逐表数据完整性。"""

import hashlib
import json
import os
import secrets
import shutil
import subprocess
import sys
from pathlib import Path


def verify_backup_restore() -> dict:
    from sqlalchemy import create_engine, inspect, text
    from sqlalchemy.engine import make_url
    from sqlalchemy.exc import IntegrityError

    from app.config.setting import settings
    from app.scripts.backup import create_backup, restore_backup, verify_backup

    root = Path(os.environ["FASTCORE_INTEGRATION_ROOT"]).resolve()
    kind = settings.DATABASE_TYPE
    url = make_url(settings.DB_URI)
    source = create_engine(url)
    admin = create_engine(url.set(database="postgres" if kind == "postgresql" else "information_schema"), isolation_level="AUTOCOMMIT")
    restored_name = "fastcore_ci_" + secrets.token_hex(8)
    restored = create_engine(url.set(database=restored_name))
    quote = source.dialect.identifier_preparer.quote
    database = {
        "type": kind, "host": settings.DATABASE_HOST, "port": settings.DATABASE_PORT,
        "name": settings.DATABASE_NAME, "user": settings.DATABASE_USER, "password": settings.DATABASE_PASSWORD,
    }
    stores = {"knowledge": root / "knowledge", "upload": root / "uploads", "chroma": root / "chroma", "bm25": root / "bm25"}

    def snapshot(engine):
        result = {}
        with engine.connect() as connection:
            inspector = inspect(connection)
            for table in sorted(inspector.get_table_names()):
                rows = sorted(json.dumps(list(row), sort_keys=True, ensure_ascii=False, default=str) for row in connection.execute(text(f"SELECT * FROM {quote(table)}")))
                result[table] = {
                    "rows": len(rows), "sha256": hashlib.sha256("\n".join(rows).encode()).hexdigest(),
                    "foreign_keys": sorted(json.dumps(key, sort_keys=True) for key in inspector.get_foreign_keys(table)),
                }
            if kind == "postgresql":
                sequences = connection.execute(text("SELECT relname FROM pg_class WHERE relkind='S' AND relnamespace='public'::regnamespace")).scalars().all()
                result["_sequences"] = {
                    name: list(connection.execute(text(f"SELECT last_value, is_called FROM {quote(name)}")).one())
                    for name in sorted(sequences)
                }
        return result

    created = False
    try:
        before = snapshot(source)
        archive = root / "acceptance-backup.zip"
        create_backup(archive, database, stores, stopped=True)
        manifest = verify_backup(archive)
        destination = root / "restored"
        restore_backup(archive, destination)
        assert manifest["database_type"] == kind
        for store, path in stores.items():
            if path.exists():
                expected = {file.relative_to(path).as_posix(): hashlib.sha256(file.read_bytes()).hexdigest() for file in path.rglob("*") if file.is_file()}
                actual = {file.relative_to(destination / store).as_posix(): hashlib.sha256(file.read_bytes()).hexdigest() for file in (destination / store).rglob("*") if file.is_file()}
                assert actual == expected, f"{store} 文件恢复不一致"
        with admin.connect() as connection:
            suffix = " CHARACTER SET utf8mb4" if kind == "mysql" else ""
            connection.execute(text(f"CREATE DATABASE {quote(restored_name)}{suffix}"))
            created = True
        # 原生客户端仅读取本次私有凭据文件，避免口令进入命令参数和证据。
        auth = root / "restore-auth"
        auth.touch(mode=0o600)
        if kind == "postgresql":
            fields = (database["host"], database["port"], restored_name, database["user"], database["password"])
            auth.write_text(":".join(str(field).replace("\\", "\\\\").replace(":", "\\:") for field in fields) + "\n")
            command = [shutil.which("psql"), "-X", "--no-password", "-v", "ON_ERROR_STOP=1", "-h", database["host"], "-p", str(database["port"]), "-U", database["user"], "-d", restored_name]
            environment = {**os.environ, "PGPASSFILE": str(auth)}
        else:
            def option(value):
                return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "\\r") + '"'

            auth.write_text("[client]\n" + "\n".join(f"{key}={option(database[key])}" for key in ("host", "port", "user", "password")))
            command = [shutil.which("mysql"), f"--defaults-extra-file={auth}", "--protocol=TCP", restored_name]
            environment = os.environ.copy()
        try:
            assert command[0], "缺少原生恢复客户端"
            with (destination / "database.sql").open("rb") as sql, (root / "native-restore.log").open("wb") as log:
                result = subprocess.run(command, stdin=sql, stdout=log, stderr=log, env=environment, timeout=60)
            assert result.returncode == 0, "原生 SQL 恢复失败，见私有 native-restore.log"
        finally:
            auth.unlink()
        after = snapshot(restored)
        assert before == after, "恢复库的逐表数据、外键或序列不一致"
        with restored.connect() as connection:
            transaction = connection.begin()
            try:
                connection.execute(text("UPDATE ai_knowledge_document SET knowledge_base_id=-1"))
            except IntegrityError:
                transaction.rollback()
            else:
                transaction.rollback()
                raise AssertionError("恢复库未强制校验外键")
        with (root / "legacy-upgrade.log").open("wb") as log:
            result = subprocess.run(
                [sys.executable, str(Path(__file__).with_name("runtime_acceptance.py")), "--phase", "legacy-upgrade"],
                env={**os.environ, "DATABASE_NAME": restored_name}, stdout=log, stderr=log, timeout=60,
            )
        assert result.returncode == 0, "旧任务增量迁移失败，见私有 legacy-upgrade.log"
        tables = {name: state for name, state in before.items() if name != "_sequences"}
        return {
            "passed": True, "database": kind, "tables": len(tables),
            "rows": sum(state["rows"] for state in tables.values()), "table_digests": tables,
            "sequence_states_equal": True if kind == "postgresql" else None, "foreign_key_rejection": True,
            "restored_files": len(manifest["files"]) - 1,
            "checks": ["native dump -> verified ZIP -> offline restore -> native SQL import",
                       "all table rows and foreign keys match", "every storage file SHA-256 matches",
                       "restored database rejects an invalid foreign key"],
        }
    finally:
        restored.dispose()
        source.dispose()
        try:
            if created:
                with admin.connect() as connection:
                    connection.execute(text(f"DROP DATABASE {quote(restored_name)}"))
        finally:
            admin.dispose()
