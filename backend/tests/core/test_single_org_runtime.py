from app.api.v1.module_system.user import service as user_service
from app.scripts.initialize import InitializeData


def test_single_org_seed_models_only_include_active_runtime_tables():
    table_names = {model.__tablename__ for model in InitializeData.prepare_init_models}
    assert "platform_tenant" not in table_names
    assert "platform_user_tenant" not in table_names


def test_current_user_menus_are_internal_scope_only():
    names = user_service.UserService.current_info.__code__.co_names
    constants = user_service.UserService.current_info.__code__.co_consts
    assert "scope" in constants
    assert "single_org" in constants
    assert "MenuCRUD" in names
