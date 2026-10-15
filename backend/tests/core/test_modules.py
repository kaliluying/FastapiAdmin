import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.v1.module_platform.menu.model import MenuModel
from app.api.v1.module_system.role.model import RoleMenusModel, RoleModel
from app.common.enums import EnvironmentEnum
from app.core import modules
from app.core.base_model import MappedBase
from app.core.modules import ModuleSpec
from app.scripts.initialize import get_seed_data
from app.scripts.prune_menus import prune_menus


def test_unregistered_module_is_not_imported(monkeypatch):
    monkeypatch.setattr(modules.module_config, "INSTALLED_MODULES", ())
    modules.get_modules.cache_clear()
    try:
        assert modules.get_modules() == ()
        assert modules.get_module_routers() == ()
        assert modules.get_module_models() == []
        assert all(menu.get("route_name") not in {"AI", "Demo"} for menu in get_seed_data("platform_menu"))
    finally:
        modules.get_modules.cache_clear()


def test_registry_rejects_duplicate_names(monkeypatch):
    monkeypatch.setattr(modules.module_config, "INSTALLED_MODULES", ("one:module", "two:module"))
    monkeypatch.setattr(modules, "resolve_entrypoint", lambda _: lambda: ModuleSpec(name="duplicate"))
    modules.get_modules.cache_clear()
    try:
        with pytest.raises(ValueError, match="不能重复"):
            modules.get_modules()
    finally:
        modules.get_modules.cache_clear()


def test_production_hides_demo_routes_and_seeds_but_preserves_schema(monkeypatch):
    monkeypatch.setattr(modules.settings, "ENVIRONMENT", EnvironmentEnum.PROD)
    assert not any(route.path.startswith("/demo") for router in modules.get_module_routers() for route in router.routes)
    assert not any(menu.get("route_name") == "Demo" for menu in get_seed_data("platform_menu"))
    assert "demo_category" in {model.__tablename__ for model in modules.get_module_models()}
    assert not modules.menu_is_active(permission="module_demo:category:query", route_name="DemoCategory")


async def test_module_hooks_start_in_order_and_stop_in_reverse(monkeypatch):
    calls = []
    monkeypatch.setattr(
        modules,
        "get_modules",
        lambda: (ModuleSpec(name="one", startup_hooks=("one:start",), shutdown_hooks=("one:stop",)), ModuleSpec(name="two", startup_hooks=("two:start",), shutdown_hooks=("two:stop",))),
    )

    async def record(entry):
        calls.append(entry)

    monkeypatch.setattr(modules, "resolve_entrypoint", lambda entry: lambda: record(entry))
    await modules.run_module_hooks()
    await modules.run_module_hooks(shutdown=True)
    assert calls == ["one:start", "two:start", "two:stop", "one:stop"]


async def test_menu_cleanup_is_explicit_scoped_and_repeatable(monkeypatch, tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'cleanup.db'}")
    try:
        async with engine.begin() as connection:
            await connection.run_sync(MappedBase.metadata.create_all)
        sessions = async_sessionmaker(engine, expire_on_commit=False)
        async with sessions() as db, db.begin():
            role = RoleModel(name="清理验证", code="cleanup-test")
            root = MenuModel(name="已裁剪模块", route_name="Retired", type=1)
            survivor = MenuModel(name="核心页面", route_name="Survivor", permission="module_system:user:query")
            db.add_all([role, root, survivor])
            await db.flush()
            child = MenuModel(name="旧页面", parent_id=root.id, permission="module_retired:item:query")
            shared_button = MenuModel(name="旧页面上传按钮", type=3, parent_id=root.id, permission="module_common:file:upload")
            db.add_all([child, shared_button])
            await db.flush()
            db.add_all([RoleMenusModel(role_id=role.id, menu_id=child.id), RoleMenusModel(role_id=role.id, menu_id=survivor.id)])
        async with sessions() as db, db.begin():
            preview = await prune_menus(db, permission_prefix="module_retired:", route_names=("Retired",))
            assert preview == {"menus": 3, "role_links": 1}
            assert len((await db.scalars(select(MenuModel.id))).all()) == 4
            with pytest.raises(ValueError, match="先移除"):
                await prune_menus(db, permission_prefix="module_system:user:", apply=True)
            with pytest.raises(ValueError, match="包含仍在使用"):
                await prune_menus(db, permission_prefix="module_retired:", route_names=("Survivor",), apply=True)
            assert await prune_menus(db, permission_prefix="module_retired:", route_names=("Retired",), apply=True) == preview
            assert await prune_menus(db, permission_prefix="module_retired:", route_names=("Retired",), apply=True) == {"menus": 0, "role_links": 0}
            assert (await db.scalars(select(MenuModel.route_name))).all() == ["Survivor"]
            assert len((await db.scalars(select(RoleMenusModel.menu_id))).all()) == 1
    finally:
        await engine.dispose()


async def test_cleanup_preserves_registered_nested_routes_without_permissions(monkeypatch, tmp_path):
    from app.scripts import initialize

    monkeypatch.setattr(initialize, "get_seed_data", lambda _: [{"route_name": "Installed", "children": [{"route_name": "InstalledChild"}]}])
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'protected.db'}")
    try:
        async with engine.begin() as connection:
            await connection.run_sync(MappedBase.metadata.create_all)
        async with async_sessionmaker(engine)() as db, db.begin():
            root = MenuModel(name="旧目录", route_name="Retired", type=1)
            db.add(root)
            await db.flush()
            db.add(MenuModel(name="仍注册的页面", route_name="InstalledChild", parent_id=root.id))
            await db.flush()
            with pytest.raises(ValueError, match="仍在注册"):
                await prune_menus(db, permission_prefix="module_retired:", route_names=("InstalledChild",), apply=True)
            with pytest.raises(ValueError, match="仍在使用"):
                await prune_menus(db, permission_prefix="module_retired:", route_names=("Retired",), apply=True)
            assert len((await db.scalars(select(MenuModel.id))).all()) == 2
    finally:
        await engine.dispose()
