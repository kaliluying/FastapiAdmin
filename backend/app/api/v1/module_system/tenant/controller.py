from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path
from fastapi.responses import JSONResponse
from redis.asyncio.client import Redis

from app.api.v1.module_system.auth.schema import AuthSchema
from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import BatchSetAvailable
from app.core.dependencies import AuthPermission, redis_getter
from app.core.logger import log
from app.core.router_class import OperationLogRoute

from .schema import (
    TenantConfigItem,
    TenantConfigOutSchema,
    TenantCreateSchema,
    TenantMenuSetSchema,
    TenantOutSchema,
    TenantQuotaOutSchema,
    TenantQuotaUpdateSchema,
    TenantQueryParam,
    TenantUpdateSchema,
    TenantUserAddSchema,
    TenantUserOutSchema,
)
from .service import TenantService

TenantRouter = APIRouter(route_class=OperationLogRoute, prefix="/tenant", tags=["租户管理"])


@TenantRouter.get(
    "/detail/{id}",
    summary="获取租户详情",
    description="获取租户详情",
    response_model=ResponseSchema[TenantOutSchema],
)
async def get_obj_detail_controller(
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:query"]))],
) -> JSONResponse:
    result_dict = await TenantService.detail_service(id=id, auth=auth)
    log.info(f"获取租户详情成功 {id}")
    return SuccessResponse(data=result_dict, msg="获取租户详情成功")


@TenantRouter.get(
    "/list",
    summary="查询租户列表",
    description="查询租户列表（分页）",
    response_model=ResponseSchema[dict],
)
async def get_obj_list_controller(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[TenantQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:query"]))],
) -> JSONResponse:
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
    log.info("查询租户列表成功")
    return SuccessResponse(data=result_dict, msg="查询租户列表成功")


@TenantRouter.post(
    "/create",
    summary="创建租户",
    description="创建租户",
    response_model=ResponseSchema[TenantOutSchema],
)
async def create_obj_controller(
    data: TenantCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:create"]))],
) -> JSONResponse:
    result_dict = await TenantService.create_service(auth=auth, data=data)
    log.info(f"创建租户成功: {result_dict.get('name')}")
    return SuccessResponse(data=result_dict, msg="创建租户成功")


@TenantRouter.put(
    "/update/{id}",
    summary="修改租户",
    description="修改租户",
    response_model=ResponseSchema[TenantOutSchema],
)
async def update_obj_controller(
    data: TenantUpdateSchema,
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:update"]))],
) -> JSONResponse:
    result_dict = await TenantService.update_service(auth=auth, id=id, data=data)
    log.info(f"修改租户成功: {result_dict.get('name')}")
    return SuccessResponse(data=result_dict, msg="修改租户成功")


@TenantRouter.delete(
    "/delete",
    summary="删除租户",
    description="删除租户",
)
async def delete_obj_controller(
    ids: Annotated[list[int], Body(..., description="ID列表")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:delete"]))],
) -> JSONResponse:
    await TenantService.delete_service(auth=auth, ids=ids)
    log.info(f"删除租户成功: {ids}")
    return SuccessResponse(msg="删除租户成功")


@TenantRouter.patch(
    "/available/setting",
    summary="批量修改租户状态",
    description="批量修改租户状态",
)
async def batch_set_available_obj_controller(
    data: BatchSetAvailable,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:patch"]))],
) -> JSONResponse:
    await TenantService.set_available_service(auth=auth, data=data)
    log.info(f"批量修改租户状态成功: {data.ids}")
    return SuccessResponse(msg="批量修改租户状态成功")


@TenantRouter.put(
    "/status/{id}",
    summary="启/禁用租户",
    description="修改单个租户的启用/禁用状态",
)
async def toggle_tenant_status_controller(
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:patch"]))],
) -> JSONResponse:
    await TenantService.toggle_status_service(auth=auth, id=id)
    log.info(f"修改租户状态成功: {id}")
    return SuccessResponse(msg="修改租户状态成功")


@TenantRouter.get(
    "/{id}/users",
    summary="获取租户用户列表",
    description="获取指定租户下的所有用户",
    response_model=ResponseSchema[list[TenantUserOutSchema]],
)
async def get_tenant_users_controller(
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:query"]))],
) -> JSONResponse:
    result = await TenantService.get_tenant_users_service(auth=auth, tenant_id=id)
    log.info(f"获取租户用户列表成功: tenant_id={id}")
    return SuccessResponse(data=result, msg="获取租户用户列表成功")


@TenantRouter.post(
    "/{id}/users",
    summary="向租户添加用户",
    description="将指定用户添加到租户中",
    response_model=ResponseSchema[None],
)
async def add_tenant_user_controller(
    id: Annotated[int, Path(description="租户ID")],
    data: TenantUserAddSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:create"]))],
) -> JSONResponse:
    await TenantService.add_tenant_user_service(auth=auth, tenant_id=id, data=data)
    log.info(f"向租户添加用户成功: tenant_id={id}, user_id={data.user_id}")
    return SuccessResponse(msg="添加用户成功")


@TenantRouter.delete(
    "/{id}/users/{uid}",
    summary="从租户移除用户",
    description="将指定用户从租户中移除",
    response_model=ResponseSchema[None],
)
async def remove_tenant_user_controller(
    id: Annotated[int, Path(description="租户ID")],
    uid: Annotated[int, Path(description="用户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:delete"]))],
) -> JSONResponse:
    await TenantService.remove_tenant_user_service(auth=auth, tenant_id=id, user_id=uid)
    log.info(f"从租户移除用户成功: tenant_id={id}, user_id={uid}")
    return SuccessResponse(msg="移除用户成功")


# ============ P1: 配额管理 ============


@TenantRouter.get(
    "/{id}/quota",
    summary="获取租户配额",
    description="获取指定租户的资源配额信息",
    response_model=ResponseSchema[TenantQuotaOutSchema],
)
async def get_tenant_quota_controller(
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:query"]))],
) -> JSONResponse:
    result = await TenantService.get_quota_service(auth=auth, tenant_id=id)
    return SuccessResponse(data=result, msg="获取租户配额成功")


@TenantRouter.put(
    "/{id}/quota",
    summary="修改租户配额",
    description="修改指定租户的资源配额（需超级管理员权限）",
    response_model=ResponseSchema[TenantQuotaOutSchema],
)
async def update_tenant_quota_controller(
    id: Annotated[int, Path(description="租户ID")],
    data: TenantQuotaUpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:update"]))],
) -> JSONResponse:
    result = await TenantService.update_quota_service(auth=auth, tenant_id=id, data=data)
    return SuccessResponse(data=result, msg="修改租户配额成功")


# ============ P1: 租户配置 ============


@TenantRouter.get(
    "/{id}/config",
    summary="获取租户配置",
    description="获取指定租户的个性化配置",
    response_model=ResponseSchema[list[TenantConfigOutSchema]],
)
async def get_tenant_config_controller(
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:query"]))],
) -> JSONResponse:
    result = await TenantService.get_config_service(auth=auth, tenant_id=id)
    return SuccessResponse(data=result, msg="获取租户配置成功")


@TenantRouter.get(
    "/{id}/config/info",
    summary="获取租户配置（公开-缓存）",
    description="从 Redis 缓存获取租户个性化配置，无需登录（供登录页等场景使用）",
    response_model=ResponseSchema[list[TenantConfigOutSchema]],
)
async def get_tenant_config_info_controller(
    id: Annotated[int, Path(description="租户ID")],
    redis: Annotated[Redis, Depends(redis_getter)],
) -> JSONResponse:
    result = await TenantService.get_config_cache_service(redis=redis, tenant_id=id)
    return SuccessResponse(data=result, msg="获取租户配置成功")


@TenantRouter.put(
    "/{id}/config",
    summary="更新租户配置",
    description="批量更新租户的个性化配置",
    response_model=ResponseSchema[list[TenantConfigOutSchema]],
)
async def update_tenant_config_controller(
    id: Annotated[int, Path(description="租户ID")],
    data: Annotated[list[TenantConfigItem], Body(..., description="配置项列表")],
    redis: Annotated[Redis, Depends(redis_getter)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:update"]))],
) -> JSONResponse:
    result = await TenantService.update_config_service(
        auth=auth, redis=redis, tenant_id=id, items=data
    )
    return SuccessResponse(data=result, msg="更新租户配置成功")


# ============ P1: 租户菜单权限 ============


@TenantRouter.get(
    "/{id}/menus",
    summary="获取租户菜单权限",
    description="获取指定租户有权限访问的菜单ID列表",
    response_model=ResponseSchema[list[int]],
)
async def get_tenant_menus_controller(
    id: Annotated[int, Path(description="租户ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:query"]))],
) -> JSONResponse:
    result = await TenantService.get_menus_service(auth=auth, tenant_id=id)
    return SuccessResponse(data=result, msg="获取租户菜单成功")


@TenantRouter.put(
    "/{id}/menus",
    summary="设置租户菜单权限",
    description="批量设置租户的菜单权限（先清空再写入，需超级管理员权限）",
)
async def set_tenant_menus_controller(
    id: Annotated[int, Path(description="租户ID")],
    data: TenantMenuSetSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:tenant:update"]))],
) -> JSONResponse:
    await TenantService.set_menus_service(auth=auth, tenant_id=id, data=data)
    log.info(f"设置租户菜单权限成功: tenant_id={id}, count={len(data.menu_ids)}")
    return SuccessResponse(msg="设置租户菜单权限成功")
