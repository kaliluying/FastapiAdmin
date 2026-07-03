from pathlib import Path
import os
import subprocess
import sys

from alembic.config import Config
from alembic.script import ScriptDirectory


BACKEND_DIR = Path(__file__).resolve().parents[1]


def test_alembic_chain_starts_from_initial_baseline() -> None:
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    script = ScriptDirectory.from_config(config)

    baseline = script.get_revision("000000000001")
    first_business_revision = script.get_revision("5fe8b5f855e5")

    assert baseline is not None
    assert baseline.down_revision is None
    assert first_business_revision is not None
    assert first_business_revision.down_revision == "000000000001"


def test_initial_baseline_creates_core_and_ai_tables() -> None:
    baseline_path = BACKEND_DIR / "app" / "alembic" / "versions" / "000000000001_initial_baseline.py"
    source = baseline_path.read_text(encoding="utf-8")

    for table_name in [
        "sys_user",
        "sys_role",
        "platform_menu",
        "ai_chat_session",
        "ai_evidence_file",
        "ai_knowledge_base",
        "ai_memory",
    ]:
        assert f'"{table_name}"' in source


def test_alembic_upgrade_head_from_empty_sqlite(tmp_path: Path) -> None:
    db_path = tmp_path / "baseline.db"
    env = {
        **os.environ,
        "DATABASE_TYPE": "sqlite",
        "DATABASE_NAME": str(db_path),
        "REDIS_ENABLE": "false",
    }

    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=BACKEND_DIR,
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )

    assert result.returncode == 0, result.stderr + result.stdout
