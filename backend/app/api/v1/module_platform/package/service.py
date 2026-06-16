import sqlalchemy as sa
from sqlalchemy import func, select

from app.api.v1.module_platform.tenant.model import TenantModel
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.core.logger import logger

from .crud import PackageCRUD
from .model import PackageMenuModel, PackageModel, PackagePluginModel
from .schema import (
    PackageCreateSchema,
    PackageMenuSetSchema,
    PackageOutSchema,
    PackagePluginSetSchema,
    PackageQueryParam,
    PackageUpdateSchema,
)


class PackageService:
    """套餐模块服务层"""

    @classmethod
    async def detail_service(cls, auth: AuthSchema, id: int) -> PackageOutSchema:
        obj = await PackageCRUD(auth).get(id=id)
        if not obj:
            raise CustomException(msg="套餐不存在")
        return PackageOutSchema.model_validate(obj)

    @classmethod
    async def page_service(
        cls,
        auth: AuthSchema,
        page_no: int,
        page_size: int,
        search: PackageQueryParam | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> dict:
        return await PackageCRUD(auth).page(
            offset=(page_no - 1) * page_size,
            limit=page_size,
            order_by=order_by or [{"sort": "asc"}, {"id": "asc"}],
            search=search.__dict__ if search else {},
            out_schema=PackageOutSchema,
        )

    @classmethod
    async def create_service(cls, auth: AuthSchema, data: PackageCreateSchema) -> PackageOutSchema:
        if await PackageCRUD(auth).get(name=data.name):
            raise CustomException(msg="创建失败，套餐名称已存在")
        if await PackageCRUD(auth).get(code=data.code):
            raise CustomException(msg="创建失败，套餐编码已存在")

        obj = await PackageCRUD(auth).create(data=data)
        result = PackageOutSchema.model_validate(obj)
        logger.info(f"创建套餐成功: {result.name}")
        return result

    @classmethod
    async def update_service(
        cls, auth: AuthSchema, id: int, data: PackageUpdateSchema
    ) -> PackageOutSchema:
        obj = await PackageCRUD(auth).get(id=id)
        if not obj:
            raise CustomException(msg="套餐不存在")

        if data.name is not None:
            exist = await PackageCRUD(auth).get(name=data.name)
            if exist and exist.id != id:
                raise CustomException(msg="更新失败，名称重复")
        if data.code is not None:
            exist = await PackageCRUD(auth).get(code=data.code)
            if exist and exist.id != id:
                raise CustomException(msg="更新失败，编码重复")

        # 套餐禁用时记录受影响租户
        if data.status is not None and data.status == 1 and obj.status == 0:
            await cls.disable_cascade_service(auth=auth, package_id=id)

        updated = await PackageCRUD(auth).update(id=id, data=data)
        
        return PackageOutSchema.model_validate(updated)

    @classmethod
    async def delete_service(cls, auth: AuthSchema, ids: list[int]) -> None:
        if not ids:
            raise CustomException(msg="删除失败，删除对象不能为空")

        for pid in ids:
            stmt = select(func.count()).select_from(TenantModel).where(TenantModel.package_id == pid)
            result = await auth.db.execute(stmt)
            count = result.scalar()
            if count and count > 0:
                raise CustomException(msg=f"套餐 ID={pid} 已被 {count} 个租户使用，无法删除")

        await PackageCRUD(auth).delete(ids=ids)

    @classmethod
    async def disable_cascade_service(cls, auth: AuthSchema, package_id: int) -> None:
        """套餐禁用时日志记录受影响租户"""
        stmt = select(TenantModel.id, TenantModel.name).where(
            TenantModel.package_id == package_id,
            TenantModel.status == 0,
        )
        result = await auth.db.execute(stmt)
        rows = result.all()
        if rows:
            tenant_ids = [row[0] for row in rows]
            logger.warning(f"套餐[{package_id}]已禁用，影响租户: {tenant_ids}")

    @classmethod
    async def get_menus_service(cls, auth: AuthSchema, package_id: int) -> list[int]:
        """获取套餐菜单权限（返回 menu_id 列表）"""
        stmt = select(PackageMenuModel.menu_id).where(PackageMenuModel.package_id == package_id)
        result = await auth.db.execute(stmt)
        return [row[0] for row in result.all()]

    @classmethod
    async def set_menus_service(
        cls, auth: AuthSchema, package_id: int, data: PackageMenuSetSchema
    ) -> None:
        
        """批量设置套餐菜单权限（先清空再写入）"""
        await auth.db.execute(sa.delete(PackageMenuModel).where(PackageMenuModel.package_id == package_id))
        for menu_id in data.menu_ids:
            auth.db.add(PackageMenuModel(package_id=package_id, menu_id=menu_id))
        await auth.db.flush()
        logger.info(f"套餐[{package_id}]菜单权限已设置, count={len(data.menu_ids)}")

    @staticmethod
    async def get_package_menu_ids(auth: AuthSchema, package_id: int) -> list[int]:
        """获取套餐包含的菜单ID列表"""
        stmt = select(PackageMenuModel.menu_id).where(PackageMenuModel.package_id == package_id)
        result = await auth.db.execute(stmt)
        return [row[0] for row in result.all()]

    @staticmethod
    async def get_tenant_available_menu_ids(auth: AuthSchema, tenant_id: int) -> list[int]:
        """获取租户的完整可用菜单ID列表（仅从套餐菜单获取）

        平台租户 (id=1) 返回全部启用菜单，不受套餐限制。
        """
        from app.api.v1.module_platform.menu.model import MenuModel
        from app.api.v1.module_platform.tenant.model import TenantModel

        if tenant_id == 1:
            menu_stmt = select(MenuModel.id).where(MenuModel.status == 0)
            result = await auth.db.execute(menu_stmt)
            return [row[0] for row in result.all()]

        stmt = select(TenantModel).where(TenantModel.id == tenant_id).limit(1)
        result = await auth.db.execute(stmt)
        tenant = result.scalar_one_or_none()
        if not tenant:
            return []

        if not tenant.package_id:
            return []

        pkg_stmt = select(PackageModel.status).where(PackageModel.id == tenant.package_id).limit(1)
        pkg_result = await auth.db.execute(pkg_stmt)
        pkg_status = pkg_result.scalar_one_or_none()
        if pkg_status != 0:
            return []

        menu_stmt = select(PackageMenuModel.menu_id).where(PackageMenuModel.package_id == tenant.package_id)
        result = await auth.db.execute(menu_stmt)
        return [row[0] for row in result.all()]

    @staticmethod
    async def get_tenant_available_plugin_ids(auth: AuthSchema, tenant_id: int) -> list[int]:
        """获取租户套餐可用的插件ID列表"""
        from app.api.v1.module_platform.tenant.model import TenantModel

        stmt = select(TenantModel).where(TenantModel.id == tenant_id).limit(1)
        result = await auth.db.execute(stmt)
        tenant = result.scalar_one_or_none()
        if not tenant or not tenant.package_id:
            return []

        pkg_stmt = select(PackageModel.status).where(PackageModel.id == tenant.package_id).limit(1)
        pkg_result = await auth.db.execute(pkg_stmt)
        pkg_status = pkg_result.scalar_one_or_none()
        if pkg_status != 0:
            return []

        plugin_stmt = select(PackagePluginModel.plugin_id).where(
            PackagePluginModel.package_id == tenant.package_id
        )
        result = await auth.db.execute(plugin_stmt)
        return [row[0] for row in result.all()]

    @classmethod
    async def get_plugins_service(cls, auth: AuthSchema, package_id: int) -> list[int]:
        """获取套餐插件权限（返回 plugin_id 列表）"""
        stmt = select(PackagePluginModel.plugin_id).where(
            PackagePluginModel.package_id == package_id
        )
        result = await auth.db.execute(stmt)
        return [row[0] for row in result.all()]

    @classmethod
    async def set_plugins_service(
        cls, auth: AuthSchema, package_id: int, data: PackagePluginSetSchema
    ) -> None:
        """批量设置套餐插件（先清空再写入）"""
        await auth.db.execute(
            sa.delete(PackagePluginModel).where(PackagePluginModel.package_id == package_id)
        )
        for plugin_id in data.plugin_ids:
            auth.db.add(PackagePluginModel(package_id=package_id, plugin_id=plugin_id))
        await auth.db.flush()
        logger.info(f"套餐[{package_id}]插件已设置, count={len(data.plugin_ids)}")
