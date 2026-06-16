"""订单与支付 Controller"""
from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path, Query, Request
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import AuthPermission, db_getter
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.core.router_class import OperationLogRoute

from .schema import (
    OrderCreateSchema,
    OrderOutSchema,
    OrderQueryParam,
    OrderStatusMessage,
    PaymentCreateOut,
    PaymentRecordOutSchema,
    PaymentStatusOut,
    RefundApplySchema,
    RefundOutSchema,
    RefundReviewSchema,
)
from .service import OrderService, PaymentService, RefundService

OrderRouter = APIRouter(route_class=OperationLogRoute, prefix="/order", tags=["平台管理/订单管理"])
PaymentRouter = APIRouter(route_class=OperationLogRoute, prefix="/payment", tags=["平台管理/支付管理"])
RefundRouter = APIRouter(route_class=OperationLogRoute, prefix="/refund", tags=["平台管理/退款管理"])
TenantOrderRouter = APIRouter(route_class=OperationLogRoute, prefix="/order", tags=["平台管理/租户订单"])


def _make_bare_auth(db: AsyncSession) -> AuthSchema:
    """构造无用户上下文的 AuthSchema（支付回调等场景）"""
    return AuthSchema(db=db, check_data_scope=False)


# ─── 平台订单 ──────────────────────────────────────────


@OrderRouter.post("/create", summary="创建订单", response_model=ResponseSchema[OrderOutSchema])
async def order_create(
    data: Annotated[OrderCreateSchema, Body()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:order:create']))],
) -> JSONResponse:
    """
    创建订单

    参数:
    - data (OrderCreateSchema): 订单创建参数。

    返回:
    - JSONResponse: 包含订单详情的 JSON 响应。
    """
    result = await OrderService.create_order(auth, data)
    return SuccessResponse(data=result, msg="订单创建成功")


@OrderRouter.get("/detail/{order_id}", summary="订单详情", response_model=ResponseSchema[OrderOutSchema])
async def order_detail(
    order_id: Annotated[int, Path(ge=1)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:order:query']))],
) -> JSONResponse:
    """
    订单详情

    参数:
    - order_id (int): 订单 ID。

    返回:
    - JSONResponse: 包含订单详情的 JSON 响应。
    """
    order = await OrderService.get_detail(auth, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    return SuccessResponse(data=order)


@OrderRouter.get("/list", summary="订单列表", response_model=ResponseSchema[PageResultSchema[OrderOutSchema]])
async def order_list(
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:order:query']))],
    tenant_id: Annotated[int | None, Query()] = None,
    status: Annotated[int | None, Query()] = None,
    order_type: Annotated[str | None, Query()] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> JSONResponse:
    """
    订单列表

    参数:
    - tenant_id (int | None): 租户 ID 筛选。
    - status (int | None): 状态筛选。
    - order_type (str | None): 订单类型筛选。
    - page (int): 页码。
    - page_size (int): 每页条数。

    返回:
    - JSONResponse: 包含分页订单列表的 JSON 响应。
    """
    params = OrderQueryParam(tenant_id=tenant_id, status=status, order_type=order_type)
    offset = (page - 1) * page_size
    items, total = await OrderService.get_list(auth, params, offset, page_size)
    result = PageResultSchema(
        page_no=page,
        page_size=page_size,
        total=total,
        has_next=offset + page_size < total,
        items=items,
    )
    return SuccessResponse(data=result)


@OrderRouter.post("/cancel/{order_id}", summary="取消订单", response_model=ResponseSchema[OrderStatusMessage])
async def order_cancel(
    order_id: Annotated[int, Path(ge=1)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:order:update']))],
) -> JSONResponse:
    """
    取消订单

    参数:
    - order_id (int): 订单 ID。

    返回:
    - JSONResponse: 包含取消结果的 JSON 响应。
    """
    result = await OrderService.cancel_order(auth, order_id)
    return SuccessResponse(data=result, msg=result["message"])

# ─── 支付 ──────────────────────────────────────────────


@PaymentRouter.post("/pay/{order_id}", summary="创建支付（获取支付 URL/二维码）", response_model=ResponseSchema[PaymentCreateOut])
async def payment_create(
    order_id: Annotated[int, Path(ge=1)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:order:update']))],
    request: Request,
    method: Annotated[str, Query(description="支付渠道: alipay / wxpay(留空=自动)")] = "",
) -> JSONResponse:
    """创建支付

    调用支付网关生成支付 URL（H5 跳转）或二维码（Native 扫码）。
    """
    base_url = str(request.base_url).rstrip("/")
    result = await PaymentService.create_payment(auth, order_id, method, base_url)
    return SuccessResponse(data=result, msg="支付信息已生成")


@PaymentRouter.get("/status/{order_id}", summary="查询支付状态（供前端轮询）", response_model=ResponseSchema[PaymentStatusOut])
async def payment_status(
    order_id: Annotated[int, Path(ge=1)],
    db: Annotated[AsyncSession, Depends(db_getter)],
) -> JSONResponse:
    """查询支付状态（无需登录，前端轮询用）"""
    auth = _make_bare_auth(db)
    result = await OrderService.check_payment_status(auth, order_id)
    return SuccessResponse(data=result)

# ─── 支付回调 ──────────────────────────────────────────


@PaymentRouter.post("/callback/{method}", summary="支付回调（统一入口）", response_model=ResponseSchema[dict])
async def payment_callback(
    method: Annotated[str, Path(description="支付渠道: alipay / wxpay / mock")],
    data: Annotated[dict, Body()],
    db: Annotated[AsyncSession, Depends(db_getter)],
) -> JSONResponse:
    """接收支付网关的异步通知（无需认证）"""
    try:
        auth = _make_bare_auth(db)
        result = await PaymentService.handle_callback(auth, method, data)
        logger.info(f"支付回调处理成功: {result}")
        return SuccessResponse(data=result)
    except CustomException as e:
        logger.warning(f"支付回调处理失败: {e}")
        return SuccessResponse(data={"message": str(e)}, code=400)


@PaymentRouter.post("/mock/callback", summary="Mock 支付回调（开发环境触发模拟支付）", response_model=ResponseSchema[dict])
async def payment_mock_callback(
    order_id: Annotated[int, Body(ge=1, description="订单 ID")],
    db: Annotated[AsyncSession, Depends(db_getter)],
) -> JSONResponse:
    """开发环境下手动触发模拟支付成功回调"""
    from app.core.payment import get_mock_gateway

    from .crud import OrderCRUD

    auth = _make_bare_auth(db)
    order = await OrderCRUD(auth).get_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")

    mock_gw = get_mock_gateway()
    callback_data = mock_gw.get_mock_callback_data(order.id, order.order_no)
    result = await PaymentService.handle_callback(auth, "mock", callback_data)
    logger.info(f"Mock 支付回调触发: order_id={order_id}")
    return SuccessResponse(data=result, msg="模拟支付成功")

# ─── 支付记录 ──────────────────────────────────────────


@PaymentRouter.get("/record/list", summary="支付记录列表", response_model=ResponseSchema[PageResultSchema[PaymentRecordOutSchema]])
async def payment_record_list(
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:order:query']))],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> JSONResponse:
    """
    支付记录列表

    参数:
    - page (int): 页码。
    - page_size (int): 每页条数。

    返回:
    - JSONResponse: 包含分页支付记录列表的 JSON 响应。
    """
    offset = (page - 1) * page_size
    items, total = await PaymentService.get_records(auth, offset, page_size)
    result = PageResultSchema(
        page_no=page,
        page_size=page_size,
        total=total,
        has_next=offset + page_size < total,
        items=items,
    )
    return SuccessResponse(data=result)

# ─── 退款管理 ──────────────────────────────────────────


@RefundRouter.get("/list", summary="退款审核列表", response_model=ResponseSchema[PageResultSchema[RefundOutSchema]])
async def refund_list(
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:order:query']))],
    status: Annotated[int | None, Query(description="状态筛选")] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> JSONResponse:
    """
    退款审核列表

    参数:
    - status (int | None): 状态筛选。
    - page (int): 页码。
    - page_size (int): 每页条数。

    返回:
    - JSONResponse: 包含分页退款列表的 JSON 响应。
    """
    offset = (page - 1) * page_size
    items, total = await RefundService.get_list(auth, status, offset, page_size)
    result = PageResultSchema(
        page_no=page,
        page_size=page_size,
        total=total,
        has_next=offset + page_size < total,
        items=items,
    )
    return SuccessResponse(data=result)


@RefundRouter.put("/approve/{refund_id}", summary="批准退款", response_model=ResponseSchema[OrderStatusMessage])
async def refund_approve(
    refund_id: Annotated[int, Path(ge=1)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:order:update']))],
) -> JSONResponse:
    """
    批准退款

    参数:
    - refund_id (int): 退款申请 ID。

    返回:
    - JSONResponse: 包含批准结果的 JSON 响应。
    """
    result = await RefundService.approve(
        auth, refund_id,
        auth.user.id if auth.user else 0,
        auth.user.name if auth.user else "",
    )
    return SuccessResponse(data=result, msg=result["message"])


@RefundRouter.put("/reject/{refund_id}", summary="驳回退款", response_model=ResponseSchema[OrderStatusMessage])
async def refund_reject(
    refund_id: Annotated[int, Path(ge=1)],
    data: Annotated[RefundReviewSchema, Body()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['module_platform:order:update']))],
) -> JSONResponse:
    """
    驳回退款

    参数:
    - refund_id (int): 退款申请 ID。
    - data (RefundReviewSchema): 驳回原因。

    返回:
    - JSONResponse: 包含驳回结果的 JSON 响应。
    """
    result = await RefundService.reject(
        auth, refund_id,
        auth.user.id if auth.user else 0, data,
        auth.user.name if auth.user else "",
    )
    return SuccessResponse(data=result, msg=result["message"])

# ─── 租户端订单 ────────────────────────────────────────


@TenantOrderRouter.post("/create", summary="租户端创建订单", response_model=ResponseSchema[OrderOutSchema])
async def tenant_order_create(
    data: Annotated[OrderCreateSchema, Body()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['tenant:order:create']))],
) -> JSONResponse:
    """
    租户端创建订单

    参数:
    - data (OrderCreateSchema): 订单创建参数。

    返回:
    - JSONResponse: 包含订单详情的 JSON 响应。
    """
    if data.tenant_id != auth.tenant_id:
        raise HTTPException(status_code=403, detail="无权操作")
    result = await OrderService.create_order(auth, data)
    return SuccessResponse(data=result, msg="订单创建成功")


@TenantOrderRouter.post("/refund/apply/{order_id}", summary="申请退款", response_model=ResponseSchema[RefundOutSchema])
async def tenant_refund_apply(
    order_id: Annotated[int, Path(ge=1)],
    data: Annotated[RefundApplySchema, Body()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['tenant:order:refund']))],
) -> JSONResponse:
    """
    租户端申请退款

    参数:
    - order_id (int): 订单 ID。
    - data (RefundApplySchema): 退款申请参数。

    返回:
    - JSONResponse: 包含退款申请结果的 JSON 响应。
    """
    result = await RefundService.apply(auth, data, order_id)
    return SuccessResponse(data=result, msg="退款申请已提交")
