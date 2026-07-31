import os
import sqlite3
import subprocess
import sys
from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory

BACKEND_DIR = Path(__file__).resolve().parents[1]


def test_alembic_chain_reaches_the_current_menu_schema() -> None:
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    script = ScriptDirectory.from_config(config)

    baseline = script.get_revision("000000000001")

    assert baseline is not None
    assert baseline.down_revision is None
    assert script.get_heads() == ["000000000002"]


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
    assert not (BACKEND_DIR / "app" / "utils" / "import_util.py").exists()
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
        menu_columns = {row[1] for row in connection.execute("PRAGMA table_info(platform_menu)")}
        menu_schema = connection.execute(
            "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'platform_menu'"
        ).fetchone()[0]

    assert {"platform_menu", "sys_role", "sys_user"} <= table_names
    assert not {"ai_chat_session", "ai_model_config", "ai_knowledge_base", "ai_memory"} & table_names
    assert {"always_show", "params"}.isdisjoint(menu_columns)
    assert "uq_platform_menu_route_name" in menu_schema
    assert "uq_platform_menu_parent_route_path" in menu_schema


def test_menu_hardening_migration_upgrades_legacy_menu_columns(tmp_path: Path) -> None:
    """The menu migration must alter existing installations, not only fresh databases."""
    db_path = tmp_path / "legacy-menu.db"
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            CREATE TABLE platform_menu (
                id INTEGER PRIMARY KEY,
                type INTEGER NOT NULL,
                parent_id INTEGER,
                route_name VARCHAR(100),
                route_path VARCHAR(200),
                always_show BOOLEAN NOT NULL DEFAULT 0,
                params JSON
            )
            """
        )

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
        menu_columns = {row[1] for row in connection.execute("PRAGMA table_info(platform_menu)")}
        menu_schema = connection.execute(
            "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'platform_menu'"
        ).fetchone()[0]

    assert {"always_show", "params"}.isdisjoint(menu_columns)
    assert "uq_platform_menu_route_name" in menu_schema
    assert "uq_platform_menu_parent_route_path" in menu_schema
