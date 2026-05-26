from datetime import datetime

import sqlalchemy as sa

from app.api.v1.module_system.auth.schema import AuthSchema
from app.core.exceptions import CustomException
from app.core.logger import log

from .crud import PluginCRUD
from .model import PluginModel, TenantPluginModel
from .schema import PluginCreateSchema, PluginOutSchema, PluginQueryParam, PluginUpdateSchema


class PluginService:

    def __init__(self):
        raise RuntimeError("Service is stateless, use classmethods")

    @classmethod
    async def page_service(cls, auth: AuthSchema, page_no: int, page_size: int,
                           search: PluginQueryParam | None = None, order_by: list | None = None) -> dict:
        return await PluginCRUD(auth).page(
            offset=(page_no - 1) * page_size, limit=page_size,
            order_by=order_by or [{"sort": "asc"}],
            search=search.__dict__ if search else {},
            out_schema=PluginOutSchema,
        )

    @classmethod
    async def detail_service(cls, auth: AuthSchema, id: int) -> dict:
        obj = await PluginCRUD(auth).get(id=id)
        if not obj:
            raise CustomException(msg="插件不存在")
        return PluginOutSchema.model_validate(obj).model_dump()

    @classmethod
    async def create_service(cls, auth: AuthSchema, data: PluginCreateSchema) -> dict:
        if await PluginCRUD(auth).get(code=data.code):
            raise CustomException(msg="插件编码已存在")
        obj = await PluginCRUD(auth).create(data=data)
        return PluginOutSchema.model_validate(obj).model_dump()

    @classmethod
    async def update_service(cls, auth: AuthSchema, id: int, data: PluginUpdateSchema) -> dict:
        obj = await PluginCRUD(auth).get(id=id)
        if not obj:
            raise CustomException(msg="插件不存在")
        updated = await PluginCRUD(auth).update(id=id, data=data)
        return PluginOutSchema.model_validate(updated).model_dump()

    @classmethod
    async def delete_service(cls, auth: AuthSchema, ids: list[int]) -> None:
        await PluginCRUD(auth).delete(ids=ids)

    # ───── 插件市场 API ─────

    @classmethod
    async def marketplace_service(cls, auth: AuthSchema, page_no: int, page_size: int,
                                   category: str | None = None) -> dict:
        search = {}
        if category:
            search["category"] = ("eq", category)
        search["status"] = ("eq", "0")
        result = await PluginCRUD(auth).page(
            offset=(page_no - 1) * page_size, limit=page_size,
            order_by=[{"sort": "asc"}], search=search,
            out_schema=PluginOutSchema,
        )
        tenant_id = getattr(auth, "tenant_id", None) or auth.user.tenant_id
        if tenant_id and result.get("items"):
            installed = await auth.db.execute(
                sa.select(TenantPluginModel.plugin_id).where(
                    TenantPluginModel.tenant_id == tenant_id,
                    TenantPluginModel.enabled == "0",
                )
            )
            installed_ids = {r[0] for r in installed.all()}
            for item in result["items"]:
                item["installed"] = item["id"] in installed_ids
        return result

    @classmethod
    async def install_service(cls, auth: AuthSchema, plugin_id: int) -> None:
        tenant_id = getattr(auth, "tenant_id", None) or auth.user.tenant_id
        if not tenant_id:
            raise CustomException(msg="无法获取租户信息")
        plugin = await PluginCRUD(auth).get(id=plugin_id)
        if not plugin or plugin.status == "1":
            raise CustomException(msg="插件不可用")
        exist = await auth.db.execute(
            sa.select(TenantPluginModel).where(
                TenantPluginModel.tenant_id == tenant_id,
                TenantPluginModel.plugin_id == plugin_id,
            ).limit(1)
        )
        if exist.scalar_one_or_none():
            await auth.db.execute(
                sa.update(TenantPluginModel).where(
                    TenantPluginModel.tenant_id == tenant_id,
                    TenantPluginModel.plugin_id == plugin_id,
                ).values(enabled="0")
            )
        else:
            tp = TenantPluginModel(tenant_id=tenant_id, plugin_id=plugin_id, enabled="0", installed_time=datetime.now())
            auth.db.add(tp)
        await auth.db.flush()
        log.info(f"租户[{tenant_id}]安装插件[{plugin.name}]")

    @classmethod
    async def uninstall_service(cls, auth: AuthSchema, plugin_id: int) -> None:
        tenant_id = getattr(auth, "tenant_id", None) or auth.user.tenant_id
        if not tenant_id:
            raise CustomException(msg="无法获取租户信息")
        await auth.db.execute(
            sa.delete(TenantPluginModel).where(
                TenantPluginModel.tenant_id == tenant_id,
                TenantPluginModel.plugin_id == plugin_id,
            )
        )
        await auth.db.flush()
        log.info(f"租户[{tenant_id}]卸载插件[{plugin_id}]")

    @classmethod
    async def toggle_service(cls, auth: AuthSchema, plugin_id: int) -> None:
        tenant_id = getattr(auth, "tenant_id", None) or auth.user.tenant_id
        tp = await auth.db.execute(
            sa.select(TenantPluginModel).where(
                TenantPluginModel.tenant_id == tenant_id,
                TenantPluginModel.plugin_id == plugin_id,
            ).limit(1)
        )
        tp = tp.scalar_one_or_none()
        if not tp:
            raise CustomException(msg="未安装该插件")
        tp.enabled = "1" if tp.enabled == "0" else "0"
        await auth.db.flush()
        log.info(f"租户[{tenant_id}]插件[{plugin_id}]状态→{tp.enabled}")

    @classmethod
    async def my_plugins_service(cls, auth: AuthSchema) -> list[dict]:
        tenant_id = getattr(auth, "tenant_id", None) or auth.user.tenant_id
        if not tenant_id:
            return []
        result = await auth.db.execute(
            sa.select(PluginModel, TenantPluginModel).join(
                TenantPluginModel, TenantPluginModel.plugin_id == PluginModel.id
            ).where(TenantPluginModel.tenant_id == tenant_id).order_by(PluginModel.sort)
        )
        plugins = []
        for p, tp in result.all():
            d = PluginOutSchema.model_validate(p).model_dump()
            d["enabled"] = tp.enabled
            d["installed"] = True
            d["installed_time"] = tp.installed_time.strftime("%Y-%m-%d %H:%M") if tp.installed_time else ""
            plugins.append(d)
        return plugins
