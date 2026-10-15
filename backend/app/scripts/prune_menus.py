"""预览或清理已裁剪模块的菜单与角色授权，不删除业务数据。"""

import argparse
import asyncio
import json
import os
import re

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession


async def prune_menus(db: AsyncSession, *, permission_prefix: str, route_names: tuple[str, ...] = (), apply: bool = False) -> dict[str, int]:
    from app.api.v1.module_platform.menu.model import MenuModel
    from app.api.v1.module_system.role.model import RoleMenusModel
    from app.core.permission_catalog import PERMISSION_CODES
    from app.scripts.initialize import get_seed_data

    if not re.fullmatch(r"module_[a-z][a-z0-9_]*:(?:[a-z][a-z0-9_]*:)?", permission_prefix):
        raise ValueError("权限前缀必须是 module_名称: 或 module_名称:功能:")
    if any(code.startswith(permission_prefix) for code in PERMISSION_CODES):
        raise ValueError("模块仍在注册，请先移除其注册项")
    registered_routes = set()
    pending = get_seed_data("platform_menu")
    while pending:
        menu = pending.pop()
        if menu.get("route_name"):
            registered_routes.add(menu["route_name"])
        pending.extend(menu.get("children") or [])
    if registered_routes.intersection(route_names):
        raise ValueError("不能清理仍在注册的菜单路由")

    menus = (await db.execute(select(MenuModel.id, MenuModel.parent_id, MenuModel.permission, MenuModel.route_name, MenuModel.type))).all()
    ids = {menu.id for menu in menus if (menu.permission or "").startswith(permission_prefix) or menu.route_name in route_names}
    while True:
        descendants = {menu.id for menu in menus if menu.parent_id in ids}
        if descendants <= ids:
            break
        ids.update(descendants)
    # 被移除页面下的按钮归该页面所有，即使它复用了基础上传等权限。
    if any(menu.id in ids and (menu.route_name in registered_routes or (menu.permission in PERMISSION_CODES and not (menu.type == 3 and menu.parent_id in ids))) for menu in menus):
        raise ValueError("目标菜单包含仍在使用的功能权限，拒绝清理")
    role_links = await db.scalar(select(func.count()).select_from(RoleMenusModel).where(RoleMenusModel.menu_id.in_(ids)))
    if apply and ids:
        await db.execute(delete(RoleMenusModel).where(RoleMenusModel.menu_id.in_(ids)))
        await db.execute(delete(MenuModel).where(MenuModel.id.in_(ids)))
    return {"menus": len(ids), "role_links": role_links or 0}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env", choices=("dev", "prod"), required=True)
    parser.add_argument("--permission-prefix", required=True)
    parser.add_argument("--route-name", action="append", default=[])
    parser.add_argument("--apply", action="store_true", help="默认仅预览；添加此参数才修改菜单与授权关系")
    args = parser.parse_args()
    os.environ["ENVIRONMENT"] = args.env

    async def run() -> None:
        from app.core.database import async_db_session, async_engine

        try:
            async with async_db_session() as db, db.begin():
                result = await prune_menus(db, permission_prefix=args.permission_prefix, route_names=tuple(args.route_name), apply=args.apply)
            print(json.dumps({"applied": args.apply, **result}))
        finally:
            await async_engine.dispose()

    try:
        asyncio.run(run())
    except ValueError as exc:
        parser.exit(1, f"清理被拒绝：{exc}\n")
    except Exception as exc:
        parser.exit(1, f"清理失败：{type(exc).__name__}；请检查目标数据库和日志。\n")


if __name__ == "__main__":
    main()
