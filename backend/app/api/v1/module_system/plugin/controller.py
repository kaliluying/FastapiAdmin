from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path

from app.api.v1.module_system.auth.schema import AuthSchema
from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import PluginCreateSchema, PluginInstallSchema, PluginOutSchema, PluginQueryParam, PluginUpdateSchema
from .service import PluginService

PluginRouter = APIRouter(route_class=OperationLogRoute, prefix="/plugin", tags=["插件管理"])


# ───── 超管：插件 CRUD ─────

@PluginRouter.get("/list", summary="插件列表", response_model=ResponseSchema[dict])
async def plugin_list(page: Annotated[PaginationQueryParam, Depends()],
                      search: Annotated[PluginQueryParam, Depends()],
                      auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:plugin:query"]))]):
    r = await PluginService.page_service(auth, page.page_no, page.page_size, search, page.order_by)
    return SuccessResponse(data=r, msg="查询成功")


@PluginRouter.get("/detail/{id}", summary="插件详情", response_model=ResponseSchema[PluginOutSchema])
async def plugin_detail(id: Annotated[int, Path()],
                        auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:plugin:query"]))]):
    return SuccessResponse(data=await PluginService.detail_service(auth, id), msg="查询成功")


@PluginRouter.post("/create", summary="创建插件", response_model=ResponseSchema[PluginOutSchema])
async def plugin_create(data: PluginCreateSchema,
                        auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:plugin:create"]))]):
    return SuccessResponse(data=await PluginService.create_service(auth, data), msg="创建成功")


@PluginRouter.put("/update/{id}", summary="更新插件", response_model=ResponseSchema[PluginOutSchema])
async def plugin_update(id: Annotated[int, Path()], data: PluginUpdateSchema,
                        auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:plugin:update"]))]):
    return SuccessResponse(data=await PluginService.update_service(auth, id, data), msg="更新成功")


@PluginRouter.delete("/delete", summary="删除插件")
async def plugin_delete(ids: Annotated[list[int], Body()],
                        auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:plugin:delete"]))]):
    await PluginService.delete_service(auth, ids)
    return SuccessResponse(msg="删除成功")


# ───── 租户：插件市场 ─────

@PluginRouter.get("/marketplace", summary="插件市场", response_model=ResponseSchema[dict])
async def marketplace(page: Annotated[PaginationQueryParam, Depends()],
                      category: str | None = None,
                      auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:plugin:query"]))] = None):
    r = await PluginService.marketplace_service(auth, page.page_no, page.page_size, category)
    return SuccessResponse(data=r, msg="查询成功")


@PluginRouter.post("/install", summary="安装插件")
async def plugin_install(data: PluginInstallSchema,
                         auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:plugin:install"]))]):
    await PluginService.install_service(auth, data.plugin_id)
    return SuccessResponse(msg="安装成功")


@PluginRouter.post("/uninstall", summary="卸载插件")
async def plugin_uninstall(data: PluginInstallSchema,
                           auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:plugin:uninstall"]))]):
    await PluginService.uninstall_service(auth, data.plugin_id)
    return SuccessResponse(msg="卸载成功")


@PluginRouter.post("/toggle", summary="启用/禁用插件")
async def plugin_toggle(data: PluginInstallSchema,
                        auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:plugin:toggle"]))]):
    await PluginService.toggle_service(auth, data.plugin_id)
    return SuccessResponse(msg="操作成功")


@PluginRouter.get("/my", summary="我的插件", response_model=ResponseSchema[list[PluginOutSchema]])
async def my_plugins(auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:plugin:query"]))]):
    return SuccessResponse(data=await PluginService.my_plugins_service(auth), msg="查询成功")
