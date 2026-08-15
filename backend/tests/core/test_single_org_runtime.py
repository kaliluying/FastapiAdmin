import pytest

from app import init_app
from app.scripts.initialize import InitializeData


@pytest.mark.asyncio
async def test_startup_applies_migrations_before_database_initialization(monkeypatch):
    """Startup migration should run through a worker thread before seeding."""
    calls: list[str] = []

    def fake_upgrade_database() -> None:
        calls.append("upgrade")

    async def fake_to_thread(function) -> None:
        calls.append("thread")
        function()

    monkeypatch.setattr(init_app, "upgrade_database", fake_upgrade_database)
    monkeypatch.setattr(init_app.asyncio, "to_thread", fake_to_thread)

    await init_app.run_startup_migration()

    assert calls == ["thread", "upgrade"]


def test_single_org_seed_models_only_include_active_runtime_tables():
    table_names = {model.__tablename__ for model in InitializeData.prepare_init_models}
    assert "platform_tenant" not in table_names
    assert "platform_user_tenant" not in table_names


def test_single_org_seed_models_include_role_menu_links():
    table_names = {model.__tablename__ for model in InitializeData.prepare_init_models}
    assert "sys_role_menus" in table_names
