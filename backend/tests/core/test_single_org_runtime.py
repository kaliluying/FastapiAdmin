from app.config.setting import settings
from app.scripts.initialize import InitializeData


def test_auto_create_tables_defaults_to_development_only(monkeypatch):
    """Default table creation to development only when no override is set."""
    monkeypatch.setattr(settings, "DATABASE_AUTO_CREATE_TABLES", None)
    monkeypatch.setattr(settings, "ENVIRONMENT", "dev")
    assert InitializeData.should_auto_create_tables() is True

    monkeypatch.setattr(settings, "ENVIRONMENT", "prod")
    assert InitializeData.should_auto_create_tables() is False


def test_auto_create_tables_honors_explicit_setting(monkeypatch):
    """Respect an explicit table-creation override in every environment."""
    monkeypatch.setattr(settings, "ENVIRONMENT", "prod")
    monkeypatch.setattr(settings, "DATABASE_AUTO_CREATE_TABLES", True)
    assert InitializeData.should_auto_create_tables() is True

    monkeypatch.setattr(settings, "DATABASE_AUTO_CREATE_TABLES", False)
    assert InitializeData.should_auto_create_tables() is False


def test_single_org_seed_models_only_include_active_runtime_tables():
    table_names = {model.__tablename__ for model in InitializeData.prepare_init_models}
    assert "platform_tenant" not in table_names
    assert "platform_user_tenant" not in table_names


def test_single_org_seed_models_include_role_menu_links():
    table_names = {model.__tablename__ for model in InitializeData.prepare_init_models}
    assert "sys_role_menus" in table_names
