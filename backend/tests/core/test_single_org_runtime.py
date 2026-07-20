from app.scripts.initialize import InitializeData


def test_single_org_seed_models_only_include_active_runtime_tables():
    table_names = {model.__tablename__ for model in InitializeData.prepare_init_models}
    assert "platform_tenant" not in table_names
    assert "platform_user_tenant" not in table_names


def test_single_org_seed_models_include_role_menu_links():
    table_names = {model.__tablename__ for model in InitializeData.prepare_init_models}
    assert "sys_role_menus" in table_names
