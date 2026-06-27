from types import SimpleNamespace

from app.api.v1.module_platform.menu.schema import MenuOutSchema


def legacy_directory_menu(**overrides):
    data = {
        "id": 1,
        "name": "系统管理",
        "type": 1,
        "order": 1,
        "route_name": "System",
        "route_path": "/system",
        "redirect": "/system/user",
        "scope": "tenant",
    }
    data.update(overrides)
    return data


def test_menu_output_normalizes_legacy_tenant_scope() -> None:
    menu = MenuOutSchema.model_validate(legacy_directory_menu())

    assert menu.scope == "single_org"


def test_menu_output_normalizes_legacy_tenant_scope_from_attributes() -> None:
    menu = MenuOutSchema.model_validate(SimpleNamespace(**legacy_directory_menu()))

    assert menu.scope == "single_org"
