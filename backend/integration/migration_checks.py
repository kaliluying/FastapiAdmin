"""在恢复得到的临时库验证旧版任务数据的增量迁移。"""

import json
import os
from pathlib import Path


def verify_legacy_upgrade() -> dict:
    from alembic import command
    from alembic.config import Config
    from sqlalchemy import create_engine, inspect, text

    from app.config.setting import settings

    engine = create_engine(settings.DB_URI)
    config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))

    def jobs():
        with engine.connect() as connection:
            return sorted(
                json.dumps({key: value for key, value in row._mapping.items() if key not in {"status", "error_message"}}, sort_keys=True, default=str)
                for row in connection.execute(text("SELECT * FROM ai_memory_extraction_job"))
            )

    try:
        expected = jobs()
        assert expected, "旧版迁移必须包含已有任务数据"
        command.downgrade(config, "20261022_memory_jobs")
        assert not {"status", "error_message"} & {column["name"] for column in inspect(engine).get_columns("ai_memory_extraction_job")}
        assert jobs() == expected
        command.upgrade(config, "head")
        assert jobs() == expected, "增量迁移不得改变任务原有字段"
        with engine.connect() as connection:
            assert connection.execute(text("SELECT count(*) FROM ai_memory_extraction_job WHERE status<>'pending' OR error_message IS NOT NULL")).scalar_one() == 0
            assert connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one() == "20261022_memory_job_terminal"
        evidence = {
            "passed": True, "database": settings.DATABASE_TYPE, "preserved_jobs": len(expected),
            "checks": ["real Alembic downgrade creates previous task schema", "existing job fields survive upgrade",
                       "new columns default to pending and NULL", "migration version reaches current head"],
        }
        (Path(os.environ["FASTCORE_INTEGRATION_ROOT"]) / "migration-results.json").write_text(json.dumps(evidence, indent=2), encoding="utf-8")
        return evidence
    finally:
        engine.dispose()
