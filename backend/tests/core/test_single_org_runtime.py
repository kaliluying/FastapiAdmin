from app.api.v1.module_system.user import service as user_service
from app.config.setting import settings
from app.scripts.initialize import InitializeData


def test_tenant_middleware_is_not_registered_for_single_org():
    assert "app.core.middlewares.TenantMiddleware" not in settings.MIDDLEWARE_LIST


def test_tenant_models_are_not_seeded_for_single_org():
    table_names = {model.__tablename__ for model in InitializeData.prepare_init_models}
    assert "platform_tenant" not in table_names
    assert "platform_user_tenant" not in table_names


def test_current_user_menus_are_internal_scope_only():
    names = user_service.UserService.current_info.__code__.co_names
    constants = user_service.UserService.current_info.__code__.co_consts
    assert "scope" in constants
    assert "single_org" in constants
    assert "MenuCRUD" in names
