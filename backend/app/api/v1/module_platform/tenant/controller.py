from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path, Query
from fastapi.responses import JSONResponse
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache
from redis.asyncio.client import Redis

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema, BatchSetAvailable, PageResultSchema
from app.core.dependencies import AuthPermission, redis_getter
from app.core.router_class import OperationLogRoute

from .schema import (
    PackageChangePreviewOut,
    TenantConfigItem,
    TenantConfigOutSchema,
    TenantCreateSchema,
    TenantOutSchema,
    TenantQueryParam,
    TenantRenewSchema,
    TenantUpdateSchema,
    TenantUserAddSchema,
    TenantUserOutSchema,
)
from .service import TenantService

TenantRouter = APIRouter(route_class=OperationLogRoute, prefix="/tenant", tags=["平台管理/租户管理"])

_TENANT_NS = "tenant"


@TenantRouter.get(
    "/detail/{id}",
    summary="获取租户详情",
    response_model=ResponseSchema[TenantOutSchema],
)
@cache(expire=120, namespace=_TENANT_NS)
async def get_obj_detail_controller(
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:query']))],
) -> JSONResponse:
    """
    获取租户详情

    参数:
    - id (int): 租户 ID。

    返回:
    - JSONResponse: 包含租户详情的 JSON 响应。
    """
    result_dict = await TenantService.detail_service(id=id, auth=auth)
    return SuccessResponse(data=result_dict, msg="获取租户详情成功")


@TenantRouter.get(
    "/list",
    summary="查询租户列表",
    response_model=ResponseSchema[PageResultSchema[TenantOutSchema]],
)
async def get_obj_list_controller(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[TenantQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:query']))],
) -> JSONResponse:
    """
    查询租户列表

    参数:
    - page (PaginationQueryParam): 分页查询参数。
    - search (TenantQueryParam): 查询筛选参数。

    返回:
    - JSONResponse: 包含分页租户列表的 JSON 响应。
    """
    order_by = [{"id": "asc"}]
    if page.order_by:
        order_by = page.order_by
    result_dict = await TenantService.page_service(
        auth=auth,
        page_no=page.page_no if page.page_no is not None else 1,
        page_size=page.page_size if page.page_size is not None else 10,
        search=search,
        order_by=order_by,
    )
    return SuccessResponse(data=result_dict, msg="查询租户列表成功")


@TenantRouter.post(
    "/create",
    summary="创建租户",
    response_model=ResponseSchema[TenantOutSchema],
)
async def create_obj_controller(
    data: TenantCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:create']))],
) -> JSONResponse:
    """
    创建租户

    参数:
    - data (TenantCreateSchema): 租户创建参数。

    返回:
    - JSONResponse: 包含创建后的租户详情的 JSON 响应。
    """
    result_dict = await TenantService.create_service(auth=auth, data=data)
    await FastAPICache.clear(namespace=_TENANT_NS)
    return SuccessResponse(data=result_dict, msg="创建租户成功")


@TenantRouter.put(
    "/update/{id}",
    summary="修改租户",
    response_model=ResponseSchema[TenantOutSchema],
)
async def update_obj_controller(
    data: TenantUpdateSchema,
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:update']))],
) -> JSONResponse:
    """
    修改租户

    参数:
    - id (int): 租户 ID。
    - data (TenantUpdateSchema): 租户更新参数。

    返回:
    - JSONResponse: 包含更新后的租户详情的 JSON 响应。
    """
    result_dict = await TenantService.update_service(auth=auth, id=id, data=data)
    await FastAPICache.clear(namespace=_TENANT_NS)
    return SuccessResponse(data=result_dict, msg="修改租户成功")


@TenantRouter.delete(
    "/delete",
    summary="删除租户",
    response_model=ResponseSchema[None],
)
async def delete_obj_controller(
    ids: Annotated[list[int], Body(..., description="ID列表")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:delete']))],
) -> JSONResponse:
    """
    删除租户

    参数:
    - ids (list[int]): 租户 ID 列表。

    返回:
    - JSONResponse: 删除结果。
    """
    await TenantService.delete_service(auth=auth, ids=ids)
    await FastAPICache.clear(namespace=_TENANT_NS)
    return SuccessResponse(msg="删除租户成功")


@TenantRouter.patch(
    "/status/batch",
    summary="批量修改租户状态",
    response_model=ResponseSchema[None],
)
async def batch_set_available_obj_controller(
    data: BatchSetAvailable,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:patch']))],
) -> JSONResponse:
    """
    批量修改租户状态

    参数:
    - data (BatchSetAvailable): 批量状态设置参数。

    返回:
    - JSONResponse: 操作结果。
    """
    await TenantService.set_available_service(auth=auth, data=data)
    await FastAPICache.clear(namespace=_TENANT_NS)
    return SuccessResponse(msg="批量修改租户状态成功")


@TenantRouter.put(
    "/status/{id}",
    summary="启/禁用租户",
    response_model=ResponseSchema[None],
)
async def toggle_tenant_status_controller(
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:patch']))],
) -> JSONResponse:
    """
    启/禁用租户

    参数:
    - id (int): 租户 ID。

    返回:
    - JSONResponse: 操作结果。
    """
    await TenantService.toggle_status_service(auth=auth, id=id)
    await FastAPICache.clear(namespace=_TENANT_NS)
    return SuccessResponse(msg="修改租户状态成功")


@TenantRouter.get(
    "/{id}/users",
    summary="获取租户用户列表",
    response_model=ResponseSchema[list[TenantUserOutSchema]],
)
@cache(expire=120, namespace=_TENANT_NS)
async def get_tenant_users_controller(
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:query']))],
) -> JSONResponse:
    """
    获取租户用户列表

    参数:
    - id (int): 租户 ID。

    返回:
    - JSONResponse: 包含租户用户列表的 JSON 响应。
    """
    result = await TenantService.get_tenant_users_service(auth=auth, tenant_id=id)
    return SuccessResponse(data=result, msg="获取租户用户列表成功")


@TenantRouter.post(
    "/{id}/users",
    summary="向租户添加用户",
    response_model=ResponseSchema[None],
)
async def add_tenant_user_controller(
    id: Annotated[int, Path(description="租户ID")],
    data: TenantUserAddSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:create']))],
) -> JSONResponse:
    """
    向租户添加用户

    参数:
    - id (int): 租户 ID。
    - data (TenantUserAddSchema): 用户添加参数。

    返回:
    - JSONResponse: 操作结果。
    """
    await TenantService.add_tenant_user_service(auth=auth, tenant_id=id, data=data)
    await FastAPICache.clear(namespace=_TENANT_NS)
    return SuccessResponse(msg="添加用户成功")


@TenantRouter.delete(
    "/{id}/users/{uid}",
    summary="从租户移除用户",
    response_model=ResponseSchema[None],
)
async def remove_tenant_user_controller(
    id: Annotated[int, Path(description="租户ID")],
    uid: Annotated[int, Path(description="用户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:delete']))],
) -> JSONResponse:
    """
    从租户移除用户

    参数:
    - id (int): 租户 ID。
    - uid (int): 用户 ID。

    返回:
    - JSONResponse: 操作结果。
    """
    await TenantService.remove_tenant_user_service(auth=auth, tenant_id=id, user_id=uid)
    await FastAPICache.clear(namespace=_TENANT_NS)
    return SuccessResponse(msg="移除用户成功")

# ============ P1: 租户配置 ============


@TenantRouter.get(
    "/{id}/config",
    summary="获取租户配置",
    response_model=ResponseSchema[list[TenantConfigOutSchema]],
)
async def get_tenant_config_controller(
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:query']))],
) -> JSONResponse:
    """
    获取租户配置

    参数:
    - id (int): 租户 ID。

    返回:
    - JSONResponse: 包含租户配置列表的 JSON 响应。
    """
    result = await TenantService.get_config_items_service(auth=auth, tenant_id=id)
    return SuccessResponse(data=result, msg="获取租户配置成功")


@TenantRouter.get(
    "/{id}/config/info",
    summary="获取租户配置（公开-缓存）",
    response_model=ResponseSchema[list[TenantConfigOutSchema]],
)
async def get_tenant_config_info_controller(
    id: Annotated[int, Path(description="租户ID")],
    redis: Annotated[Redis, Depends(redis_getter)],
) -> JSONResponse:
    """
    获取租户配置（公开-缓存）

    参数:
    - id (int): 租户 ID。

    返回:
    - JSONResponse: 包含租户配置列表的 JSON 响应。
    """
    result = await TenantService.get_config_cache_items_service(redis=redis, tenant_id=id)
    return SuccessResponse(data=result, msg="获取租户配置成功")


@TenantRouter.put(
    "/{id}/config",
    summary="更新租户配置",
    response_model=ResponseSchema[list[TenantConfigOutSchema]],
)
async def update_tenant_config_controller(
    id: Annotated[int, Path(description="租户ID")],
    data: Annotated[list[TenantConfigItem], Body(..., description="配置项列表")],
    redis: Annotated[Redis, Depends(redis_getter)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:update']))],
) -> JSONResponse:
    """
    更新租户配置

    参数:
    - id (int): 租户 ID。
    - data (list[TenantConfigItem]): 配置项列表。

    返回:
    - JSONResponse: 包含更新后的配置列表的 JSON 响应。
    """
    result = await TenantService.update_config_service(
        auth=auth, redis=redis, tenant_id=id, config=data
    )
    await FastAPICache.clear(namespace=_TENANT_NS)
    return SuccessResponse(data=result, msg="更新租户配置成功")

# ============ 续期 ============


@TenantRouter.put(
    "/renew/{id}",
    summary="租户续期",
    response_model=ResponseSchema[TenantOutSchema],
)
async def renew_tenant_controller(
    id: Annotated[int, Path(description="租户ID")],
    data: TenantRenewSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:update']))],
) -> JSONResponse:
    """
    租户续期

    参数:
    - id (int): 租户 ID。
    - data (TenantRenewSchema): 续期时间参数。

    返回:
    - JSONResponse: 包含续期后的租户详情的 JSON 响应。
    """
    result = await TenantService.renew_service(auth=auth, tenant_id=id, end_time=data.end_time)
    await FastAPICache.clear(namespace=_TENANT_NS)
    return SuccessResponse(data=result, msg="租户续期成功")

# ============ 套餐变更预览 ============


@TenantRouter.get(
    "/{id}/package-change-preview",
    summary="套餐变更影响预览",
    response_model=ResponseSchema[PackageChangePreviewOut],
)
async def package_change_preview_controller(
    id: Annotated[int, Path(description="租户ID")],
    new_package_id: Annotated[int, Query(..., description="目标套餐ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_system:tenant:query']))],
) -> JSONResponse:
    """
    套餐变更影响预览

    参数:
    - id (int): 租户 ID。
    - new_package_id (int): 目标套餐 ID。

    返回:
    - JSONResponse: 包含套餐变更影响预览的 JSON 响应。
    """
    result = await TenantService.package_change_preview_service(
        auth=auth, tenant_id=id, new_package_id=new_package_id
    )
    return SuccessResponse(data=result, msg="套餐变更预览成功")
