"""数据库初始化与增量种子数据管理。"""

import asyncio
import json
import re
from datetime import datetime, time
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.module_platform.menu.model import MenuModel
from app.api.v1.module_system.dict.model import DictDataModel, DictTypeModel
from app.api.v1.module_system.log.model import LoginLogModel, OperationLogModel
from app.api.v1.module_system.params.model import ParamsModel
from app.api.v1.module_system.role.model import RoleMenusModel, RoleModel
from app.api.v1.module_system.user.model import UserModel, UserRolesModel
from app.config.path_conf import SCRIPT_DIR
from app.core.database import async_db_session, create_tables
from app.core.logger import logger
from app.core.plugins import filter_ai_seed_data, load_ai_models


class InitializeData:
    """初始化数据库和基础数据"""

    _DATETIME_RE = re.compile(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$")
    _DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    _TIME_RE = re.compile(r"^\d{2}:\d{2}:\d{2}(\.\d+)?$")

    # 按依赖关系排序：先基础表，再关联表。已启用插件模型在运行时追加。
    prepare_init_models: list[type] = [
        # ── 平台管理：基础表 ──
        MenuModel,
        # ── 系统管理：基础表 ──
        ParamsModel,
        RoleModel,
        DictTypeModel,
        DictDataModel,
        UserModel,
        # ── 关联表 ──
        RoleMenusModel,
        UserRolesModel,
        # ── 其他系统/业务表 ──
        # ── 日志表（追加写入） ──
        LoginLogModel,
        OperationLogModel,
    ]

    @classmethod
    def get_prepare_init_models(cls) -> list[type]:
        """返回核心模型与已启用插件模型组成的初始化列表。

        返回:
        - list[type]: 按外键依赖顺序排列的初始化模型列表。
        """
        return [*cls.prepare_init_models, *load_ai_models()]

    # 树形模型：JSON 含嵌套 children，需递归创建对象
    _RECURSIVE_TABLES: set[str] = {"platform_menu"}

    async def init_db(self) -> None:
        """按当前 ORM 模型创建骨架表并导入种子数据。"""
        try:
            load_ai_models()
            await create_tables()
        except asyncio.exceptions.TimeoutError:
            logger.error("❌️ 数据库表结构初始化超时")
            raise

        async with async_db_session() as session:
            async with session.begin():
                await self.__init_data(session)

    async def __init_data(self, db: AsyncSession) -> None:
        """按依赖顺序初始化各表种子数据"""
        dict_type_mapping: dict[str, DictTypeModel] = {}
        role_seed_mapping: dict[int, RoleModel] = {}
        user_seed_mapping: dict[int, UserModel] = {}

        for model in self.get_prepare_init_models():
            table_name = model.__tablename__

            data = await self.__load_json(table_name)
            if not data:
                logger.info(f"⏭️  跳过 {table_name} 表，无初始化数据")
                continue

            try:
                # 树形菜单表：递归创建含 children 的对象
                if table_name in self._RECURSIVE_TABLES:
                    added = await self.__seed_menus(db, data)
                    logger.info(f"✅️ 已向 {table_name} 补齐 {added} 条初始化数据")
                    continue

                # 字典类型表：存储类型映射供字典数据使用
                if table_name == "sys_dict_type":
                    added = await self.__seed_unique_rows(db, model, data, ("dict_type",))
                    rows = (await db.execute(select(DictTypeModel))).scalars().all()
                    dict_type_mapping = {row.dict_type: row for row in rows}
                    logger.info(f"✅️ 已向 {table_name} 补齐 {added} 条初始化数据")
                    continue

                # 字典数据表：关联 dict_type_id
                if table_name == "sys_dict_data":
                    added = 0
                    for item in data:
                        dict_type_str = item.get("dict_type")
                        dict_type_obj = dict_type_mapping.get(dict_type_str)
                        if not dict_type_obj:
                            logger.warning(f"⚠️  未找到字典类型 {dict_type_str}，跳过")
                            continue
                        existing = await db.scalar(
                            select(DictDataModel).where(
                                DictDataModel.dict_type_id == dict_type_obj.id,
                                DictDataModel.dict_value == item["dict_value"],
                            )
                        )
                        if existing:
                            continue
                        values = {**item, "dict_type_id": dict_type_obj.id}
                        values.pop("id", None)
                        db.add(model(**values))
                        added += 1
                    if added:
                        await db.flush()
                    logger.info(f"✅️ 已向 {table_name} 补齐 {added} 条初始化数据")
                    continue

                # 角色使用 code 作为稳定唯一键，并建立种子行号到数据库主键的映射。
                if table_name == "sys_role":
                    added = await self.__seed_unique_rows(db, model, data, ("code",))
                    rows = (await db.execute(select(RoleModel))).scalars().all()
                    roles_by_code = {row.code: row for row in rows}
                    role_seed_mapping = {
                        index: roles_by_code[item["code"]]
                        for index, item in enumerate(data, start=1)
                        if item.get("code") in roles_by_code
                    }
                    logger.info(f"✅️ 已向 {table_name} 补齐 {added} 条初始化数据")
                    continue

                # 用户使用 username 作为稳定唯一键；审计外键在全部用户创建后再按种子行号解析。
                if table_name == "sys_user":
                    added, user_seed_mapping = await self.__seed_users(db, data)
                    logger.info(f"✅️ 已向 {table_name} 补齐 {added} 条初始化数据")
                    continue

                if table_name == "sys_role_menus":
                    roles = (await db.execute(select(RoleModel))).scalars().all()
                    roles_by_code = {role.code: role for role in roles}
                    existing_links = {
                        (row.role_id, row.menu_id)
                        for row in (await db.execute(select(RoleMenusModel))).scalars().all()
                    }
                    links = []
                    for item in data:
                        role = roles_by_code.get(item["role_code"])
                        if not role:
                            raise ValueError(f"角色菜单种子引用了不存在的角色: {item['role_code']}")

                        if "permission" in item:
                            menu_stmt = select(MenuModel).where(MenuModel.permission == item["permission"])
                        else:
                            menu_stmt = select(MenuModel).where(MenuModel.route_name == item["route_name"])
                        menus = (await db.execute(menu_stmt)).scalars().all()
                        if not menus:
                            raise ValueError(f"角色菜单种子未匹配菜单: {item}")
                        for menu in menus:
                            link_key = (role.id, menu.id)
                            if link_key not in existing_links:
                                links.append(RoleMenusModel(role_id=role.id, menu_id=menu.id))
                                existing_links.add(link_key)

                    if links:
                        db.add_all(links)
                        await db.flush()
                    logger.info(f"✅️ 已向 {table_name} 补齐 {len(links)} 条")
                    continue

                if table_name == "sys_user_roles":
                    existing_links = {
                        (row.user_id, row.role_id)
                        for row in (await db.execute(select(UserRolesModel))).scalars().all()
                    }
                    links = []
                    for item in data:
                        user = user_seed_mapping.get(int(item["user_id"]))
                        role = role_seed_mapping.get(int(item["role_id"]))
                        if not user or not role:
                            raise ValueError(f"用户角色种子引用了不存在的用户或角色: {item}")
                        link_key = (user.id, role.id)
                        if link_key not in existing_links:
                            links.append(UserRolesModel(user_id=user.id, role_id=role.id))
                            existing_links.add(link_key)

                    if links:
                        db.add_all(links)
                        await db.flush()
                    logger.info(f"✅️ 已向 {table_name} 补齐 {len(links)} 条")
                    continue

                # 日志表：追加写入，已有数据跳过
                if table_name in ("sys_login_log", "sys_operation_log"):
                    count = await db.execute(select(func.count()).select_from(model))
                    if count.scalar():
                        logger.info(f"⏭️  跳过 {table_name} 表数据初始化（表已有数据）")
                        continue
                    objs = [model(**item) for item in data]
                    db.add_all(objs)
                    await db.flush()
                    logger.info(f"✅️ 已向 {table_name} 写入 {len(objs)} 条")
                    continue

                # 日志等没有稳定业务唯一键的表只在空表时写入示例数据。
                count = await db.scalar(select(func.count()).select_from(model))
                if count:
                    logger.info(f"⏭️  跳过 {table_name} 表数据初始化（表已有数据）")
                    continue
                objs = [model(**item) for item in data]
                db.add_all(objs)
                await db.flush()
                logger.info(f"✅️ 已向 {table_name} 写入初始化数据")

            except Exception:
                logger.error(f"❌️ 初始化 {table_name} 表数据失败")
                raise

    async def __seed_unique_rows(
        self,
        db: AsyncSession,
        model: type,
        data: list[dict[str, Any]],
        unique_fields: tuple[str, ...],
    ) -> int:
        """按逻辑唯一键补齐普通种子记录。

        参数:
        - db: 当前初始化事务。
        - model: 要写入的 ORM 模型。
        - data: 已解析的种子数据。
        - unique_fields: 能跨数据库稳定匹配记录的字段名。

        返回:
        - int: 实际新增的记录数。
        """
        added = 0
        for item in data:
            conditions = [getattr(model, field) == item[field] for field in unique_fields]
            if await db.scalar(select(model).where(*conditions)):
                continue
            values = {key: value for key, value in item.items() if key not in {"id", "children"}}
            db.add(model(**values))
            added += 1
        if added:
            await db.flush()
        return added

    async def __seed_users(
        self,
        db: AsyncSession,
        data: list[dict[str, Any]],
    ) -> tuple[int, dict[int, UserModel]]:
        """按 username 补齐用户，并安全解析审计字段引用。

        参数:
        - db: 当前初始化事务。
        - data: 用户种子数据，关联表使用其行号作为稳定引用。

        返回:
        - tuple[int, dict[int, UserModel]]: 新增数量及种子行号到用户对象的映射。

        副作用:
        - 只为新用户写入种子密码；已有用户的密码和业务字段不会被覆盖。
        """
        users_by_username = {
            user.username: user
            for user in (await db.execute(select(UserModel))).scalars().all()
        }
        new_users: list[tuple[UserModel, dict[str, Any]]] = []
        added = 0
        for item in data:
            username = item["username"]
            user = users_by_username.get(username)
            if user:
                continue
            values = {
                key: value
                for key, value in item.items()
                if key not in {"id", "created_id", "updated_id", "deleted_id"}
            }
            user = UserModel(**values)
            db.add(user)
            new_users.append((user, item))
            users_by_username[username] = user
            added += 1

        if new_users:
            await db.flush()

        users_by_seed_id = {
            index: users_by_username[item["username"]]
            for index, item in enumerate(data, start=1)
            if item.get("username") in users_by_username
        }
        for user, item in new_users:
            for field in ("created_id", "updated_id", "deleted_id"):
                seed_id = item.get(field)
                referenced_user = users_by_seed_id.get(int(seed_id)) if seed_id is not None else None
                setattr(user, field, referenced_user.id if referenced_user else None)
        if new_users:
            await db.flush()
        return added, users_by_seed_id

    async def __seed_menus(self, db: AsyncSession, data: list[dict[str, Any]]) -> int:
        """递归按权限或路由键补齐菜单树，不覆盖已有菜单关系。

        参数:
        - db: 当前初始化事务。
        - data: 含嵌套 ``children`` 的菜单种子数据。

        返回:
        - int: 实际新增的菜单数。
        """
        added = 0

        async def seed_item(item: dict[str, Any], parent_id: int | None) -> None:
            nonlocal added
            children = item.get("children", [])
            permission = item.get("permission")
            route_name = item.get("route_name")
            if permission:
                statement = select(MenuModel).where(MenuModel.permission == permission)
            elif route_name:
                statement = select(MenuModel).where(MenuModel.route_name == route_name)
            else:
                statement = select(MenuModel).where(
                    MenuModel.parent_id == parent_id,
                    MenuModel.name == item.get("name"),
                    MenuModel.type == item.get("type"),
                )
            menu = await db.scalar(statement)
            if not menu:
                values = {key: value for key, value in item.items() if key != "children"}
                values["parent_id"] = parent_id
                menu = MenuModel(**values)
                db.add(menu)
                await db.flush()
                added += 1

            for child in children:
                await seed_item(child, menu.id)

        for item in data:
            await seed_item(item, None)
        return added

    async def __load_json(self, filename: str) -> list[dict]:
        """读取并解析种子数据 JSON 文件"""
        json_path = SCRIPT_DIR / f"{filename}.json"
        if not json_path.exists():
            return []

        try:
            with open(json_path, encoding="utf-8") as f:
                raw = json.loads(f.read())
            data = [self._parse_date_strings(item) for item in raw]
            return filter_ai_seed_data(filename, data)
        except json.JSONDecodeError as e:
            logger.error(f"❌️ 解析 {json_path} 失败: {e!s}")
            raise
        except Exception as e:
            logger.error(f"❌️ 读取 {json_path} 失败: {e!s}")
            raise

    @classmethod
    def _parse_date_strings(cls, data: dict) -> dict:
        """递归转换 JSON 中的日期时间字符串为 datetime 对象（兼容 PostgreSQL）"""
        result = {}
        for key, value in data.items():
            if isinstance(value, str):
                if cls._DATETIME_RE.match(value):
                    result[key] = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
                elif cls._DATE_RE.match(value):
                    result[key] = datetime.strptime(value, "%Y-%m-%d").date()
                elif cls._TIME_RE.match(value):
                    result[key] = time.fromisoformat(value)
                else:
                    result[key] = value
            elif isinstance(value, dict):
                result[key] = cls._parse_date_strings(value)
            else:
                result[key] = value
        return result
