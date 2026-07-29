import os
import sqlite3
import subprocess
import sys
from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory

BACKEND_DIR = Path(__file__).resolve().parents[1]


def test_alembic_chain_is_a_single_current_schema_baseline() -> None:
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    script = ScriptDirectory.from_config(config)

    baseline = script.get_revision("000000000001")

    assert baseline is not None
    assert baseline.down_revision is None
    assert script.get_heads() == ["000000000001"]


def test_initial_baseline_creates_only_core_tables() -> None:
    baseline_path = BACKEND_DIR / "app" / "alembic" / "versions" / "000000000001_initial_baseline.py"
    source = baseline_path.read_text(encoding="utf-8")

    for table_name in [
        "MenuModel",
        "RoleModel",
        "RoleMenusModel",
        "UserModel",
        "UserRolesModel",
    ]:
        assert table_name in source
    assert "ImportUtil.find_models" not in source
    assert "module_ai" not in source
    assert "sys_dept" not in source
    assert "sys_role_depts" not in source


def test_alembic_upgrade_head_from_empty_sqlite(tmp_path: Path) -> None:
    db_path = tmp_path / "baseline.db"
    env = {
        **os.environ,
        "DATABASE_TYPE": "sqlite",
        "DATABASE_NAME": str(db_path.with_suffix("")),
        "REDIS_ENABLE": "false",
        "PYTHONUTF8": "1",
    }

    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=BACKEND_DIR,
        env=env,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=30,
    )

    assert result.returncode == 0, result.stderr + result.stdout

    with sqlite3.connect(db_path) as connection:
        table_names = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'")}

    assert {"platform_menu", "sys_role", "sys_user"} <= table_names
    assert not {"ai_chat_session", "ai_model_config", "ai_knowledge_base", "ai_memory"} & table_names
