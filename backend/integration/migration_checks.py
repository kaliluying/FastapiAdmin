"""在恢复得到的临时库验证任务数据与迁移降级保护。"""

import json
import os
import secrets
from datetime import datetime, timedelta
from pathlib import Path


def verify_legacy_upgrade() -> dict:
    from alembic import command
    from alembic.config import Config
    from sqlalchemy import Column, Integer, MetaData, Table, create_engine, inspect, text
    from sqlalchemy.engine import make_url

    from app.config.setting import settings

    engine = create_engine(settings.DB_URI)
    config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))

    def jobs():
        with engine.connect() as connection:
            return sorted(
                json.dumps(dict(row._mapping), sort_keys=True, default=str)
                for row in connection.execute(text("SELECT * FROM ai_memory_extraction_job"))
            )

    try:
        expected = jobs()
        assert expected, "旧版迁移必须包含已有任务数据"
        with engine.connect() as connection:
            current_revision = connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
        try:
            command.downgrade(config, "20261022_memory_jobs")
        except RuntimeError as exc:
            assert "诊断任务及证据" in str(exc)
        else:
            raise AssertionError("存在 Agent 历史时降级应被拒绝")
        assert jobs() == expected
        with engine.connect() as connection:
            assert connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one() == current_revision
            assert {"ai_agent_run", "ai_agent_event"} <= set(inspect(engine).get_table_names())

        # 用独立旧版库验证升级，不能为制造夹具删除恢复库中的 Agent 历史。
        url = make_url(settings.DB_URI)
        admin = create_engine(url.set(database="postgres" if settings.DATABASE_TYPE == "postgresql" else "information_schema"),
                              isolation_level="AUTOCOMMIT")
        legacy_name = "fastcore_ci_" + secrets.token_hex(8)
        legacy = create_engine(url.set(database=legacy_name))
        quote = engine.dialect.identifier_preparer.quote
        original_name = settings.DATABASE_NAME
        created = False
        try:
            with admin.connect() as connection:
                suffix = " CHARACTER SET utf8mb4" if settings.DATABASE_TYPE == "mysql" else ""
                connection.execute(text(f"CREATE DATABASE {quote(legacy_name)}{suffix}"))
                created = True
            Table("sys_user", MetaData(), Column("id", Integer, primary_key=True)).create(legacy)
            settings.DATABASE_NAME = legacy_name
            command.stamp(config, "20261011_ai_quality")
            command.upgrade(config, "20261022_memory_jobs")
            old_jobs = Table("ai_memory_extraction_job", MetaData(), autoload_with=legacy)
            now = datetime(2026, 1, 1, 12)
            fixtures = [
                {"id": index, "run_id": f"legacy-run-{index}", "session_id": f"legacy-session-{index}",
                 "user_id": str(index), "user_message": "以后回答简洁", "assistant_response": "好的",
                 "attempts": index - 1, "available_at": now, "lease_until": now + timedelta(seconds=30) if index == 2 else None,
                 "token": "legacy-lease" if index == 2 else None}
                for index in (1, 2)
            ]
            with legacy.begin() as connection:
                connection.execute(old_jobs.insert(), fixtures)
                before = [dict(row._mapping) for row in connection.execute(old_jobs.select().order_by(old_jobs.c.id))]
            command.upgrade(config, "head")
            with legacy.connect() as connection:
                after = [dict(row._mapping) for row in connection.execute(text("SELECT * FROM ai_memory_extraction_job ORDER BY id"))]
                assert connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one() == current_revision
            assert [{key: row[key] for key in before[0]} for row in after] == before, "旧任务升级后已有字段改变"
            assert all(row["status"] == "pending" and row["error_message"] is None for row in after)
            assert {"ai_agent_run", "ai_agent_event"} <= set(inspect(legacy).get_table_names())
        finally:
            settings.DATABASE_NAME = original_name
            legacy.dispose()
            try:
                if created:
                    with admin.connect() as connection:
                        connection.execute(text(f"DROP DATABASE {quote(legacy_name)}"))
            finally:
                admin.dispose()
        evidence = {
            "passed": True, "database": settings.DATABASE_TYPE, "preserved_jobs": len(expected),
            "upgraded_legacy_jobs": len(after),
            "checks": ["real Alembic downgrade rejects deletion of Agent history", "existing job fields survive the rejected downgrade",
                       "migration version and Agent tables remain unchanged",
                       "independent legacy database upgrades existing jobs without changing old fields",
                       "upgraded jobs receive pending status and null error defaults"],
        }
        (Path(os.environ["FASTCORE_INTEGRATION_ROOT"]) / "migration-results.json").write_text(json.dumps(evidence, indent=2), encoding="utf-8")
        return evidence
    finally:
        engine.dispose()
