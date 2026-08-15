from pathlib import Path

from sqlalchemy import create_engine, inspect

from app.scripts import migrate


def test_upgrade_database_applies_a_real_revision(tmp_path: Path) -> None:
    """Apply a temporary Alembic revision without adding a skeleton migration."""
    migrations = tmp_path / "migrations"
    versions = migrations / "versions"
    versions.mkdir(parents=True)
    (migrations / "env.py").write_text(
        """from alembic import context
from sqlalchemy import engine_from_config, pool

config = context.config


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection)
        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
""",
        encoding="utf-8",
    )
    (versions / "0001_probe.py").write_text(
        """from alembic import op
import sqlalchemy as sa

revision = "0001_probe"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("migration_probe", sa.Column("id", sa.Integer, primary_key=True))


def downgrade():
    op.drop_table("migration_probe")
""",
        encoding="utf-8",
    )
    database = tmp_path / "probe.db"
    (tmp_path / "alembic.ini").write_text(
        f"[alembic]\nscript_location = %(here)s/migrations\nsqlalchemy.url = sqlite:///{database}\n",
        encoding="utf-8",
    )

    original_base_dir = migrate.BASE_DIR
    migrate.BASE_DIR = tmp_path
    try:
        assert migrate.upgrade_database() is True
        assert migrate.upgrade_database() is True
    finally:
        migrate.BASE_DIR = original_base_dir

    engine = create_engine(f"sqlite:///{database}")
    try:
        tables = set(inspect(engine).get_table_names())
    finally:
        engine.dispose()

    assert {"alembic_version", "migration_probe"} <= tables
