from types import SimpleNamespace

from app.api.v1.module_system.user.service import UserService


def test_user_menu_whitelist_rejects_legacy_product_selection_menu() -> None:
    UserService._allowed_menu_keys = None
    legacy_menu = SimpleNamespace(
        permission="module_amazon:product:query",
        route_name="AmazonProduct",
        route_path="/amazon/product",
        component_path="module_amazon/product/index",
        title="Amazon选品",
    )

    assert not UserService._is_builtin_menu(legacy_menu)


def test_user_menu_whitelist_allows_seed_menu() -> None:
    UserService._allowed_menu_keys = None
    seed_menu = SimpleNamespace(
        permission="module_system:user:query",
        route_name="User",
        route_path="user",
        component_path="module_system/user/index",
        title="用户管理",
    )

    assert UserService._is_builtin_menu(seed_menu)
