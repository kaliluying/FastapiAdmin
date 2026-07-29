from app.config.setting import settings
from app.scripts.initialize import InitializeData


def test_auto_create_tables_requires_an_explicit_setting(monkeypatch):
    """Application startup should not create tables unless explicitly enabled."""
    monkeypatch.setattr(settings, "DATABASE_AUTO_CREATE_TABLES", False)
    assert InitializeData.should_auto_create_tables() is False

    monkeypatch.setattr(settings, "DATABASE_AUTO_CREATE_TABLES", True)
    assert InitializeData.should_auto_create_tables() is True


def test_single_org_seed_models_only_include_active_runtime_tables():
    table_names = {model.__tablename__ for model in InitializeData.prepare_init_models}
    assert "platform_tenant" not in table_names
    assert "platform_user_tenant" not in table_names


def test_single_org_seed_models_include_role_menu_links():
    table_names = {model.__tablename__ for model in InitializeData.prepare_init_models}
    assert "sys_role_menus" in table_names
