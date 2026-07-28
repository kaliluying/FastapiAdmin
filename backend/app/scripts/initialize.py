"""
数据库初始化与种子数据管理。

简化策略：每张表为空时一次性插入种子数据，已有数据则跳过。
改 JSON → 清空对应表 → 重启即可。
"""

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
from app.core.plugins import is_plugin_enabled


def _load_optional_models() -> list[type]:
    """加载当前启用插件的 ORM 模型。

    返回:
    - list[type]: 需要加入 SQLAlchemy metadata 与种子初始化流程的模型类。

    异常/副作用:
    - AI 插件关闭或目录不存在时返回空列表；启用时导入其模型并注册到 metadata。
    """
    if not is_plugin_enabled("module_ai"):
        return []

    from app.plugin.module_ai.chat.model import AiModelConfigModel, ChatSessionModel
    from app.plugin.module_ai.knowledge.model import KnowledgeBaseModel, KnowledgeChunkModel, KnowledgeDocumentModel

    return [
        ChatSessionModel,
        AiModelConfigModel,
        KnowledgeBaseModel,
        KnowledgeDocumentModel,
        KnowledgeChunkModel,
    ]


class InitializeData:
    """初始化数据库和基础数据"""

    _DATETIME_RE = re.compile(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$")
    _DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    _TIME_RE = re.compile(r"^\d{2}:\d{2}:\d{2}(\.\d+)?$")

    # 按依赖关系排序：先基础表，再关联表。插件模型在模块启用时追加。
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
        *_load_optional_models(),
    ]

    @staticmethod
    def _load_optional_models() -> list[type]:
        """加载当前启用插件的 ORM 模型，保持向后兼容的类级入口。"""
        return _load_optional_models()

    @classmethod
    def get_prepare_init_models(cls) -> list[type]:
        """返回核心模型与已启用插件模型组成的初始化列表。

        返回:
        - list[type]: 按外键依赖顺序排列的初始化模型列表。
        """
        return list(cls.prepare_init_models)

    # 树形模型：JSON 含嵌套 children，需递归创建对象
    _RECURSIVE_TABLES: set[str] = {"platform_menu"}

    async def init_db(self) -> None:
        """建表并导入种子数据"""
        try:
            self._load_optional_models()
            await create_tables()
        except asyncio.exceptions.TimeoutError:
            logger.error("❌️ 数据库表结构初始化超时")
            raise

        async with async_db_session() as session:
            async with session.begin():
                await self.__init_data(session)

    async def __init_data(self, db: AsyncSession) -> None:
        """按依赖顺序初始化各表种子数据"""
        dict_type_mapping: dict[str, Any] = {}  # dict_type → DictTypeModel 实例

        for model in self.get_prepare_init_models():
            table_name = model.__tablename__

            data = await self.__load_json(table_name)
            if not data:
                logger.info(f"⏭️  跳过 {table_name} 表，无初始化数据")
                continue

            try:
                # 树形菜单表：递归创建含 children 的对象
                if table_name in self._RECURSIVE_TABLES:
                    count = await db.execute(select(func.count()).select_from(model))
                    if count.scalar():
                        logger.info(f"⏭️  跳过 {table_name} 表数据初始化（表已有数据）")
                        continue
                    objs = self.__create_objects_with_children(data, model)
                    db.add_all(objs)
                    await db.flush()
                    logger.info(f"✅️ 已向 {table_name} 写入初始化数据")
                    continue

                # 字典类型表：存储类型映射供字典数据使用
                if table_name == "sys_dict_type":
                    count = await db.execute(select(func.count()).select_from(model))
                    if count.scalar():
                        logger.info(f"⏭️  跳过 {table_name} 表数据初始化（表已有数据）")
                        continue
                    objs = []
                    for item in data:
                        obj = model(**item)
                        objs.append(obj)
                        dict_type_mapping[item["dict_type"]] = obj
                    db.add_all(objs)
                    await db.flush()
                    logger.info(f"✅️ 已向 {table_name} 写入初始化数据")
                    continue

                # 字典数据表：关联 dict_type_id
                if table_name == "sys_dict_data":
                    count = await db.execute(select(func.count()).select_from(model))
                    if count.scalar():
                        logger.info(f"⏭️  跳过 {table_name} 表数据初始化（表已有数据）")
                        continue
                    objs = []
                    for item in data:
                        dict_type_str = item.get("dict_type")
                        if dict_type_str not in dict_type_mapping:
                            logger.warning(f"⚠️  未找到字典类型 {dict_type_str}，跳过")
                            continue
                        item["dict_type_id"] = dict_type_mapping[dict_type_str].id
                        objs.append(model(**item))
                    db.add_all(objs)
                    await db.flush()
                    logger.info(f"✅️ 已向 {table_name} 写入初始化数据")
                    continue

                if table_name == "sys_role_menus":
                    count = await db.execute(select(func.count()).select_from(model))
                    if count.scalar():
                        logger.info(f"⏭️  跳过 {table_name} 表数据初始化（表已有数据）")
                        continue

                    roles = (await db.execute(select(RoleModel))).scalars().all()
                    roles_by_code = {role.code: role for role in roles}
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
                        links.extend(RoleMenusModel(role_id=role.id, menu_id=menu.id) for menu in menus)

                    db.add_all(links)
                    await db.flush()
                    logger.info(f"✅️ 已向 {table_name} 写入 {len(links)} 条")
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

                # 普通表：空表时插入，已有数据跳过
                count = await db.execute(select(func.count()).select_from(model))
                if count.scalar():
                    logger.info(f"⏭️  跳过 {table_name} 表数据初始化（表已有数据）")
                    continue
                objs = [model(**item) for item in data]
                db.add_all(objs)
                await db.flush()
                logger.info(f"✅️ 已向 {table_name} 写入初始化数据")

            except Exception:
                logger.error(f"❌️ 初始化 {table_name} 表数据失败")
                raise

    @staticmethod
    def __create_objects_with_children(data: list[dict], model_class: type) -> list:
        """递归创建树形模型实例，处理嵌套 children 并注入 parent_id"""

        def _create(obj_data: dict) -> Any:
            children_data = obj_data.pop("children", [])

            # JSON 中子节点 parent_id 通常为 null，先按原始值创建
            obj = model_class(**obj_data)

            if children_data:
                obj.children = [_create(child) for child in children_data]

            return obj

        return [_create(item) for item in data]

    async def __load_json(self, filename: str) -> list[dict]:
        """读取并解析种子数据 JSON 文件"""
        json_path = SCRIPT_DIR / f"{filename}.json"
        if not json_path.exists():
            return []

        try:
            with open(json_path, encoding="utf-8") as f:
                raw = json.loads(f.read())
            data = [self._parse_date_strings(item) for item in raw]
            return self._filter_disabled_plugin_seed_data(filename, data)
        except json.JSONDecodeError as e:
            logger.error(f"❌️ 解析 {json_path} 失败: {e!s}")
            raise
        except Exception as e:
            logger.error(f"❌️ 读取 {json_path} 失败: {e!s}")
            raise

    @staticmethod
    def _filter_disabled_plugin_seed_data(filename: str, data: list[dict]) -> list[dict]:
        """过滤已禁用插件的菜单与角色权限种子。

        参数:
        - filename: 种子表名，不含 ``.json`` 后缀。
        - data: 已完成日期转换的种子记录。

        返回:
        - list[dict]: 保留核心后台数据后的种子记录。
        """
        if is_plugin_enabled("module_ai"):
            return data

        if filename == "sys_role_menus":
            return [item for item in data if item.get("route_name") != "AI" and not str(item.get("permission", "")).startswith("module_ai:")]

        if filename != "platform_menu":
            return data

        def filter_menu_items(items: list[dict]) -> list[dict]:
            filtered: list[dict] = []
            for raw_item in items:
                item = {key: value for key, value in raw_item.items() if key != "children"}
                children = filter_menu_items(raw_item.get("children", []))
                if children:
                    item["children"] = children

                is_ai_item = (
                    item.get("route_name") == "AI"
                    or str(item.get("route_path", "")).strip("/") == "ai"
                    or str(item.get("component_path", "")).startswith("module_ai")
                    or str(item.get("permission", "")).startswith("module_ai:")
                )
                if not is_ai_item:
                    filtered.append(item)
            return filtered

        return filter_menu_items(data)

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
