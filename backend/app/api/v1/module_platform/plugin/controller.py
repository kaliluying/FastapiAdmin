from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path
from fastapi.responses import JSONResponse
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import (
    PluginCreateSchema,
    PluginInstallSchema,
    PluginOutSchema,
    PluginQueryParam,
    PluginUpdateSchema,
)
from .service import PluginService

PluginRouter = APIRouter(route_class=OperationLogRoute, prefix="/plugin", tags=["平台管理/插件管理"])

_PLUGIN_NS = "plugin"

# ───── 超管：插件 CRUD ─────


@PluginRouter.get("/list", summary="插件列表", response_model=ResponseSchema[PageResultSchema[PluginOutSchema]])
@cache(expire=300, namespace=_PLUGIN_NS)
async def plugin_list(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[PluginQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:plugin:query']))],
) -> JSONResponse:
    """
    插件列表

    参数:
    - page (PaginationQueryParam): 分页查询参数。
    - search (PluginQueryParam): 查询筛选参数。

    返回:
    - JSONResponse: 包含分页插件列表的 JSON 响应。
    """
    r = await PluginService.page_service(auth, page.page_no, page.page_size, search, page.order_by)
    return SuccessResponse(data=r, msg="查询成功")


@PluginRouter.get(
    "/detail/{id}", summary="插件详情", response_model=ResponseSchema[PluginOutSchema]
)
async def plugin_detail(
    id: Annotated[int, Path()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:plugin:query']))],
) -> JSONResponse:
    """
    插件详情

    参数:
    - id (int): 插件 ID。

    返回:
    - JSONResponse: 包含插件详情的 JSON 响应。
    """
    return SuccessResponse(data=await PluginService.detail_service(auth, id), msg="查询成功")


@PluginRouter.post("/create", summary="创建插件", response_model=ResponseSchema[PluginOutSchema])
async def plugin_create(
    data: PluginCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:plugin:create']))],
) -> JSONResponse:
    """
    创建插件

    参数:
    - data (PluginCreateSchema): 插件创建参数。

    返回:
    - JSONResponse: 包含创建后的插件详情的 JSON 响应。
    """
    r = await PluginService.create_service(auth, data)
    await FastAPICache.clear(namespace=_PLUGIN_NS)
    return SuccessResponse(data=r, msg="创建成功")


@PluginRouter.put(
    "/update/{id}", summary="更新插件", response_model=ResponseSchema[PluginOutSchema]
)
async def plugin_update(
    id: Annotated[int, Path()],
    data: PluginUpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:plugin:update']))],
) -> JSONResponse:
    """
    更新插件

    参数:
    - id (int): 插件 ID。
    - data (PluginUpdateSchema): 插件更新参数。

    返回:
    - JSONResponse: 包含更新后的插件详情的 JSON 响应。
    """
    r = await PluginService.update_service(auth, id, data)
    await FastAPICache.clear(namespace=_PLUGIN_NS)
    return SuccessResponse(data=r, msg="更新成功")


@PluginRouter.delete("/delete", summary="删除插件", response_model=ResponseSchema[None])
async def plugin_delete(
    ids: Annotated[list[int], Body()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:plugin:delete']))],
) -> JSONResponse:
    """
    删除插件

    参数:
    - ids (list[int]): 插件 ID 列表。

    返回:
    - JSONResponse: 删除结果。
    """
    await PluginService.delete_service(auth, ids)
    await FastAPICache.clear(namespace=_PLUGIN_NS)
    return SuccessResponse(msg="删除成功")

# ───── 租户：插件市场 ─────


@PluginRouter.get("/marketplace", summary="插件市场", response_model=ResponseSchema[PageResultSchema[PluginOutSchema]])
@cache(expire=600, namespace=_PLUGIN_NS)
async def marketplace(
    page: Annotated[PaginationQueryParam, Depends()],
    category: str | None = None,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:plugin:query']))] = None,
) -> JSONResponse:
    """
    插件市场

    参数:
    - page (PaginationQueryParam): 分页查询参数。
    - category (str | None): 分类筛选。

    返回:
    - JSONResponse: 包含分页市场插件列表的 JSON 响应。
    """
    r = await PluginService.marketplace_service(auth, page.page_no, page.page_size, category)
    return SuccessResponse(data=r, msg="查询成功")


@PluginRouter.post("/install", summary="安装插件", response_model=ResponseSchema[None])
async def plugin_install(
    data: PluginInstallSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:plugin:install']))],
) -> JSONResponse:
    """
    安装插件

    参数:
    - data (PluginInstallSchema): 安装参数（插件 ID）。

    返回:
    - JSONResponse: 安装结果。
    """
    await PluginService.install_service(auth, data.plugin_id)
    await FastAPICache.clear(namespace=_PLUGIN_NS)
    return SuccessResponse(msg="安装成功")


@PluginRouter.post("/uninstall", summary="卸载插件", response_model=ResponseSchema[None])
async def plugin_uninstall(
    data: PluginInstallSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:plugin:uninstall']))],
) -> JSONResponse:
    """
    卸载插件

    参数:
    - data (PluginInstallSchema): 卸载参数（插件 ID）。

    返回:
    - JSONResponse: 卸载结果。
    """
    await PluginService.uninstall_service(auth, data.plugin_id)
    await FastAPICache.clear(namespace=_PLUGIN_NS)
    return SuccessResponse(msg="卸载成功")


@PluginRouter.post("/toggle", summary="启用/禁用插件", response_model=ResponseSchema[None])
async def plugin_toggle(
    data: PluginInstallSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:plugin:toggle']))],
) -> JSONResponse:
    """
    启用/禁用插件

    参数:
    - data (PluginInstallSchema): 操作参数（插件 ID）。

    返回:
    - JSONResponse: 操作结果。
    """
    await PluginService.toggle_service(auth, data.plugin_id)
    await FastAPICache.clear(namespace=_PLUGIN_NS)
    return SuccessResponse(msg="操作成功")


@PluginRouter.get("/my", summary="我的插件", response_model=ResponseSchema[list[PluginOutSchema]])
@cache(expire=120, namespace=_PLUGIN_NS)
async def my_plugins(
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:plugin:query']))],
) -> JSONResponse:
    """
    我的插件

    返回:
    - JSONResponse: 包含已安装插件列表的 JSON 响应。
    """
    return SuccessResponse(data=await PluginService.my_plugins_service(auth), msg="查询成功")


@PluginRouter.post("/reload", summary="热重载插件路由", response_model=ResponseSchema[str])
async def plugin_reload(
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:plugin:reload']))],
) -> JSONResponse:
    """
    热重载插件路由（管理员）。

    重新扫描 app/plugin/module_* 目录，清除模块缓存并注册新路由，
    无需重启服务器。
    """
    msg = PluginService.reload_service()
    await FastAPICache.clear(namespace=_PLUGIN_NS)
    return SuccessResponse(data=msg, msg="重载成功")
