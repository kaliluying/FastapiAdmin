"""Independent offline backup drill; never loads application database configuration."""

import hashlib
import json
import os
import sqlite3
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

from app.scripts.backup import create_backup, restore_backup, verify_backup


class BackupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.source = self.root / "source.sqlite3"
        with sqlite3.connect(self.source) as db:
            db.executescript(
                "PRAGMA foreign_keys=ON; CREATE TABLE document(id INTEGER PRIMARY KEY, title TEXT UNIQUE NOT NULL); CREATE TABLE chunk(id INTEGER PRIMARY KEY, document_id INTEGER REFERENCES document(id), content TEXT); INSERT INTO document VALUES (1, '验收文档'); INSERT INTO chunk VALUES (1, 1, '恢复查询');"
            )
        self.database = {"type": "sqlite", "path": self.source}
        self.stores = {name: self.root / name for name in ("knowledge", "upload", "chroma", "bm25")}
        for directory in self.stores.values():
            directory.mkdir()
        (self.stores["knowledge"] / "原始文档.txt").write_text("恢复查询", encoding="utf-8")
        (self.stores["upload"] / "empty").mkdir()
        self.archive = self.root / "backup.zip"

    def create(self):
        create_backup(self.archive, self.database, self.stores, stopped=True)

    def test_sql_files_and_real_search_indexes_restore(self):
        # A separate process exits before copying, so Chroma and Whoosh are closed.
        script = """
import sys
from pathlib import Path
import chromadb
from whoosh import index
from whoosh.fields import Schema, ID, TEXT
root = Path(sys.argv[1])
client = chromadb.PersistentClient(path=str(root / "chroma"))
collection = client.get_or_create_collection("knowledge_base")
collection.add(ids=["chunk-1"], embeddings=[[1.0, 0.0, 0.0]], documents=["恢复查询"], metadatas=[{"document_id": 1, "knowledge_base_id": 1}])
idx = index.create_in(str(root / "bm25"), Schema(chunk_id=ID(stored=True), content=TEXT(stored=True)))
with idx.writer() as writer:
    writer.add_document(chunk_id="chunk-1", content="backup recovery")
"""
        subprocess.run([sys.executable, "-c", script, str(self.root)], check=True, capture_output=True)
        self.create()
        manifest = verify_backup(self.archive)
        self.assertEqual(manifest["stores"], sorted(self.stores))
        self.assertEqual(os.stat(self.archive).st_mode & 0o777, 0o600)
        target = self.root / "restored"
        subprocess.run([sys.executable, "-m", "app.scripts.backup", "verify", str(self.archive)], check=True, capture_output=True)
        subprocess.run([sys.executable, "-m", "app.scripts.backup", "restore", str(self.archive), "--target", str(target)], check=True, capture_output=True)
        self.assertTrue((target / "upload" / "empty").is_dir())
        self.assertEqual((target / "knowledge" / "原始文档.txt").read_text(), "恢复查询")
        with sqlite3.connect(target / "database.db") as db:
            self.assertEqual(db.execute("SELECT document.title, chunk.content FROM document JOIN chunk ON document.id=chunk.document_id").fetchone(), ("验收文档", "恢复查询"))
            db.execute("PRAGMA foreign_keys=ON")
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute("INSERT INTO chunk VALUES (2, 999, 'invalid')")
        query = """
import sys
import chromadb
from whoosh import index
from whoosh.qparser import QueryParser
from pathlib import Path
root = Path(sys.argv[1])
client = chromadb.PersistentClient(path=str(root / "chroma"))
result = client.get_collection("knowledge_base").query(query_embeddings=[[1.0, 0.0, 0.0]], n_results=1, where={"knowledge_base_id": 1})
assert result["ids"] == [["chunk-1"]]
assert result["documents"] == [["恢复查询"]]
idx = index.open_dir(str(root / "bm25"))
with idx.searcher() as searcher:
    hits = searcher.search(QueryParser("content", idx.schema).parse("recovery"))
    assert len(hits) == 1 and hits[0]["chunk_id"] == "chunk-1"
"""
        subprocess.run([sys.executable, "-c", query, str(target)], check=True, capture_output=True)

    def test_cli_create_requires_stop_before_settings_loading(self):
        env = {**os.environ, "SECRET_KEY": "unsafe-private-secret", "DATABASE_TYPE": "unsupported"}
        result = subprocess.run([sys.executable, "-m", "app.scripts.backup", "create", "--env=prod", "--output", str(self.archive)], env=env, capture_output=True, text=True)
        self.assertEqual(result.returncode, 1)
        self.assertIn("--writers-stopped", result.stderr)
        self.assertNotIn("unsafe-private-secret", result.stderr)
        self.assertFalse(self.archive.exists())

    def test_requires_stopped_and_never_overwrites(self):
        with self.assertRaises(ValueError):
            create_backup(self.archive, self.database, self.stores, stopped=False)
        self.create()
        original = self.archive.read_bytes()
        with self.assertRaises(ValueError):
            self.create()
        target = self.root / "existing"
        target.mkdir()
        sentinel = target / "sentinel"
        sentinel.write_text("untouched")
        with self.assertRaises(ValueError):
            restore_backup(self.archive, target)
        self.assertEqual(sentinel.read_text(), "untouched")
        self.assertEqual(self.archive.read_bytes(), original)

    def test_symlink_and_source_overlap_rejected(self):
        (self.stores["knowledge"] / "linked").symlink_to(self.source)
        with self.assertRaises(ValueError):
            self.create()
        self.assertFalse(self.archive.exists())
        self.assertEqual(list(self.root.glob(".backup-*")), [])
        with self.assertRaises(ValueError):
            create_backup(self.stores["knowledge"] / "backup.zip", self.database, self.stores, stopped=True)

    def _changed_archive(self, change):
        self.create()
        with zipfile.ZipFile(self.archive) as bundle:
            files = {name: bundle.read(name) for name in bundle.namelist()}
        change(files)
        damaged = self.root / "damaged.zip"
        with zipfile.ZipFile(damaged, "w") as bundle:
            for name, data in files.items():
                bundle.writestr(name, data)
        return damaged

    def test_corruption_prevents_any_restore_write(self):
        damaged = self._changed_archive(lambda files: files.update({"knowledge/原始文档.txt": b"changed"}))
        target = self.root / "restore-failed"
        with self.assertRaises(ValueError):
            restore_backup(damaged, target)
        self.assertFalse(target.exists())
        self.assertEqual(list(self.root.glob(".restore-*")), [])

    def test_traversal_manifest_rejected(self):
        def change(files):
            manifest = json.loads(files["manifest.json"])
            name = "../escape"
            files[name] = b"bad"
            manifest["files"][name] = {"sha256": hashlib.sha256(b"bad").hexdigest(), "size": 3}
            files["manifest.json"] = json.dumps(manifest).encode()

        damaged = self._changed_archive(change)
        with self.assertRaises(ValueError):
            verify_backup(damaged)
        self.assertFalse((self.root.parent / "escape").exists())

    def test_database_failure_leaves_no_output(self):
        self.database["path"] = self.root / "missing.sqlite3"
        with self.assertRaises(ValueError):
            self.create()
        self.assertFalse(self.archive.exists())
        self.assertFalse(self.database["path"].exists())

    def test_special_source_file_rejected_without_blocking(self):
        os.mkfifo(self.stores["knowledge"] / "pipe")
        with self.assertRaises(ValueError):
            self.create()
        self.assertFalse(self.archive.exists())

    def test_failed_restore_copy_cleans_staging_and_lock(self):
        self.create()
        target = self.root / "copy-failed"
        with patch("app.scripts.backup.shutil.copyfileobj", side_effect=OSError("simulated full disk")):
            with self.assertRaises(OSError):
                restore_backup(self.archive, target)
        self.assertFalse(target.exists())
        self.assertEqual(list(self.root.glob(".restore-*")), [])
        self.assertFalse((self.root / ".copy-failed.restore.lock").exists())

    def test_archive_symlink_entry_rejected(self):
        self.create()
        with zipfile.ZipFile(self.archive, "a") as bundle:
            entry = zipfile.ZipInfo("knowledge/link")
            entry.external_attr = 0o120777 << 16
            bundle.writestr(entry, "../../secret")
        with self.assertRaises(ValueError):
            verify_backup(self.archive)

    def test_native_dump_missing_client_is_clear(self):
        with patch("app.scripts.backup.shutil.which", return_value=None):
            with self.assertRaisesRegex(ValueError, "缺少"):
                create_backup(self.archive, {"type": "mysql"}, self.stores, stopped=True)
        self.assertFalse(self.archive.exists())

    def test_native_dump_never_stores_connection_secrets(self):
        password = "private-token-do-not-log"
        archive = self.root / "mysql.zip"
        database = {"type": "mysql", "host": "localhost", "port": 3306, "user": "test", "password": password, "name": "isolated"}

        def run(args, *, stdout, stderr, check, env=None):
            self.assertNotIn(password, " ".join(args))
            stdout.write(b"native-dump-fixture")
            return subprocess.CompletedProcess(args, 0)

        with patch("app.scripts.backup.shutil.which", return_value="fake-client"), patch("app.scripts.backup.subprocess.run", side_effect=run):
            create_backup(archive, database, self.stores, stopped=True)
        with zipfile.ZipFile(archive) as bundle:
            self.assertNotIn(password, bundle.read("manifest.json").decode())
        restore_backup(archive, self.root / "restored-mysql")

    def test_postgresql_dump_uses_private_passfile_and_escapes_match_fields(self):
        password = "private:password\\value"
        archive = self.root / "postgresql.zip"
        database = {"type": "postgresql", "host": "db*host?", "port": 5432, "user": "test", "password": password, "name": "isolated"}

        def run(args, *, stdout, stderr, check, env):
            self.assertNotIn(password, " ".join(args))
            self.assertEqual(args[0], "fake-pg-dump")
            passfile = Path(env["PGPASSFILE"])
            self.assertEqual(os.stat(passfile).st_mode & 0o777, 0o600)
            self.assertEqual(passfile.read_text(), r"db\*host\?:5432:isolated:test:private\:password\\value" + "\n")
            stdout.write(b"postgresql-dump-fixture")
            return subprocess.CompletedProcess(args, 0)

        with patch("app.scripts.backup.shutil.which", return_value="fake-pg-dump"), patch("app.scripts.backup.subprocess.run", side_effect=run):
            create_backup(archive, database, self.stores, stopped=True)
        manifest = verify_backup(archive)
        self.assertEqual(manifest["database_type"], "postgresql")


if __name__ == "__main__":
    unittest.main()
