"""租户自助服务 Controller — 对应 PRD §20.20"""
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema
from app.core.dependencies import AuthPermission, get_current_user
from app.core.router_class import OperationLogRoute

from .schema import (
    PackageAvailableOut,
    PackagePreviewOut,
    PluginPurchaseCreate,
    SelfOrderCreate,
    SelfOrderDetailOut,
    SelfOrderListOut,
    SelfOrderOut,
    WorkspaceOut,
)
from .service import (
    create_plugin_purchase_order,
    create_self_order,
    get_available_packages,
    get_self_order_detail,
    get_self_order_list,
    preview_package_change,
)

TenantSelfServiceRouter = APIRouter(
    route_class=OperationLogRoute,
    prefix="/tenant",
    tags=["平台管理/自助服务"],
)


@TenantSelfServiceRouter.get(
    "/package/available",
    summary="可选套餐列表",
    response_model=ResponseSchema[PackageAvailableOut],
)
async def package_available(
    auth: Annotated[AuthSchema, Depends(AuthPermission(['tenant:package:query']))],
):
    """
    可选套餐列表

    返回:
    - SuccessResponse: 包含可用套餐列表的 JSON 响应。
    """
    result = await get_available_packages(auth=auth, tenant_id=auth.tenant_id)
    return SuccessResponse(data=result, msg="查询成功")


@TenantSelfServiceRouter.get(
    "/package/preview",
    summary="套餐变更影响预览",
    response_model=ResponseSchema[PackagePreviewOut],
)
async def package_preview(
    target_package_id: Annotated[int, Query(ge=1, description="目标套餐ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['tenant:package:query']))],
):
    """
    套餐变更影响预览

    参数:
    - target_package_id (int): 目标套餐 ID。

    返回:
    - SuccessResponse: 包含套餐变更影响预览的 JSON 响应。
    """
    result = await preview_package_change(
        auth=auth, tenant_id=auth.tenant_id, target_package_id=target_package_id
    )
    return SuccessResponse(data=result, msg="查询成功")


@TenantSelfServiceRouter.post(
    "/order/create",
    summary="创建自助订单",
    response_model=ResponseSchema[SelfOrderOut],
)
async def order_create(
    data: SelfOrderCreate,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['tenant:order:create']))],
):
    """
    创建自助订单

    参数:
    - data (SelfOrderCreate): 订单创建参数。

    返回:
    - SuccessResponse: 包含订单详情的 JSON 响应。
    """
    result = await create_self_order(
        auth=auth, tenant_id=auth.tenant_id, data=data
    )
    return SuccessResponse(data=result, msg="订单创建成功")


@TenantSelfServiceRouter.post(
    "/plugin/purchase",
    summary="购买付费插件",
    response_model=ResponseSchema[SelfOrderOut],
)
async def plugin_purchase(
    data: PluginPurchaseCreate,
    auth: Annotated[AuthSchema, Depends(AuthPermission(['tenant:order:create']))],
):
    """
    购买付费插件

    参数:
    - data (PluginPurchaseCreate): 插件购买参数。

    返回:
    - SuccessResponse: 包含订单详情的 JSON 响应。
    """
    result = await create_plugin_purchase_order(
        auth=auth, tenant_id=auth.tenant_id, data=data
    )
    return SuccessResponse(data=result, msg="插件订单创建成功")


@TenantSelfServiceRouter.get(
    "/order/list",
    summary="我的订单列表",
    response_model=ResponseSchema[SelfOrderListOut],
)
async def order_list(
    page: Annotated[PaginationQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['tenant:order:query']))],
):
    """
    我的订单列表

    参数:
    - page (PaginationQueryParam): 分页查询参数。

    返回:
    - SuccessResponse: 包含分页订单列表的 JSON 响应。
    """
    result = await get_self_order_list(
        auth=auth,
        tenant_id=auth.tenant_id,
        page_no=page.page_no,
        page_size=page.page_size,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result, msg="查询成功")


@TenantSelfServiceRouter.get(
    "/order/detail/{order_id}",
    summary="订单详情",
    response_model=ResponseSchema[SelfOrderDetailOut],
)
async def order_detail(
    order_id: Annotated[int, Path(ge=1, description="订单ID")],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['tenant:order:query']))],
):
    """
    订单详情

    参数:
    - order_id (int): 订单 ID。

    返回:
    - SuccessResponse: 包含订单详情的 JSON 响应。
    """
    result = await get_self_order_detail(
        auth=auth, tenant_id=auth.tenant_id, order_id=order_id
    )
    return SuccessResponse(data=result, msg="查询成功")


@TenantSelfServiceRouter.get(
    "/workspace",
    summary="租户工作台概览",
    response_model=ResponseSchema[WorkspaceOut],
)
async def tenant_workspace(
    auth: Annotated[AuthSchema, Depends(get_current_user)],
):
    """
    租户工作台概览

    返回:
    - SuccessResponse: 包含工作台概览信息的 JSON 响应。
    """
    from .service import get_workspace_data

    result = await get_workspace_data(auth=auth, tenant_id=auth.tenant_id)
    return SuccessResponse(data=result, msg="查询成功")
