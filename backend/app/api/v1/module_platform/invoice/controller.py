"""发票管理 Controller"""
from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path, Query
from fastapi.responses import JSONResponse

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import AuthPermission
from app.core.exceptions import CustomException
from app.core.router_class import OperationLogRoute

from .crud import InvoiceCRUD
from .schema import (
    InvoiceApplySchema,
    InvoiceIssueSchema,
    InvoiceOutSchema,
    InvoiceQueryParam,
    InvoiceVoidSchema,
)
from .service import InvoicePlatformService, InvoiceTenantService

# ========== 租户端 API ==========

TenantInvoiceRouter = APIRouter(prefix="/tenant/invoice", route_class=OperationLogRoute, tags=["平台管理/发票管理"])


@TenantInvoiceRouter.post("/apply", summary="申请开票", response_model=ResponseSchema[InvoiceOutSchema])
async def invoice_apply(
    data: Annotated[InvoiceApplySchema, Body()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['*:*:*']))],
) -> JSONResponse:
    """
    申请开票

    参数:
    - data (InvoiceApplySchema): 发票申请参数。

    返回:
    - JSONResponse: 包含发票信息的 JSON 响应。
    """
    result = await InvoiceTenantService.apply(auth, data, auth.tenant_id)
    return SuccessResponse(data=result, msg="发票申请成功")


@TenantInvoiceRouter.get("/list", summary="我的发票列表", response_model=ResponseSchema[PageResultSchema[InvoiceOutSchema]])
async def invoice_list_my(
    auth: Annotated[AuthSchema, Depends(AuthPermission(['*:*:*']))],
    invoice_type: Annotated[str | None, Query()] = None,
    status: Annotated[int | None, Query()] = None,
    page_no: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
) -> JSONResponse:
    """
    我的发票列表

    参数:
    - invoice_type (str | None): 发票类型筛选。
    - status (int | None): 状态筛选。
    - page_no (int): 页码。
    - page_size (int): 每页条数。

    返回:
    - JSONResponse: 包含分页发票列表的 JSON 响应。
    """
    result = await InvoiceTenantService.list_my(
        auth, auth.tenant_id,
        InvoiceQueryParam(invoice_type=invoice_type, status=status, page_no=page_no, page_size=page_size),
    )
    return SuccessResponse(data=result, msg="查询成功")


@TenantInvoiceRouter.get("/{id}/download", summary="下载发票PDF", response_model=ResponseSchema[dict])
async def invoice_download(
    id: Annotated[int, Path(ge=1)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['*:*:*']))],
) -> JSONResponse:
    """
    下载发票 PDF

    参数:
    - id (int): 发票 ID。

    返回:
    - JSONResponse: 包含 PDF 下载地址的 JSON 响应。
    """
    crud = InvoiceCRUD(auth)
    invoice = await crud.get(id=id)
    if not invoice:
        raise CustomException(msg="发票不存在")
    if hasattr(invoice, "tenant_id") and invoice.tenant_id != auth.tenant_id:
        raise CustomException(msg="发票不存在")
    if invoice.status != 1 or not invoice.pdf_url:
        raise CustomException(msg="发票未开具或无PDF")
    return SuccessResponse(msg="下载地址", data={"pdf_url": invoice.pdf_url})

# ========== 平台端 API ==========


PlatformInvoiceRouter = APIRouter(prefix="/invoice", route_class=OperationLogRoute, tags=["平台管理/发票管理"])


@PlatformInvoiceRouter.get("/list", summary="全部发票列表", response_model=ResponseSchema[PageResultSchema[InvoiceOutSchema]])
async def invoice_list_all(
    auth: Annotated[AuthSchema, Depends(AuthPermission(['*:*:*']))],
    invoice_type: Annotated[str | None, Query()] = None,
    status: Annotated[int | None, Query()] = None,
    tenant_id: Annotated[int | None, Query()] = None,
    page_no: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
) -> JSONResponse:
    """
    全部发票列表（平台端）

    参数:
    - invoice_type (str | None): 发票类型筛选。
    - status (int | None): 状态筛选。
    - tenant_id (int | None): 租户 ID 筛选。
    - page_no (int): 页码。
    - page_size (int): 每页条数。

    返回:
    - JSONResponse: 包含分页发票列表的 JSON 响应。
    """
    result = await InvoicePlatformService.list_all(
        auth,
        InvoiceQueryParam(invoice_type=invoice_type, status=status, tenant_id=tenant_id, page_no=page_no, page_size=page_size),
    )
    return SuccessResponse(data=result, msg="查询成功")


@PlatformInvoiceRouter.put("/issue/{id}", summary="开具发票", response_model=ResponseSchema[InvoiceOutSchema])
async def invoice_issue(
    id: Annotated[int, Path(ge=1)],
    data: Annotated[InvoiceIssueSchema, Body()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['*:*:*']))],
) -> JSONResponse:
    """
    开具发票

    参数:
    - id (int): 发票 ID。
    - data (InvoiceIssueSchema): 开票参数（PDF 链接等）。

    返回:
    - JSONResponse: 包含发票信息的 JSON 响应。
    """
    result = await InvoicePlatformService.issue(
        auth, id, data.pdf_url or "", data.api_response or "",
    )
    return SuccessResponse(data=result, msg="发票开具成功")


@PlatformInvoiceRouter.put("/void/{id}", summary="作废发票", response_model=ResponseSchema[InvoiceOutSchema])
async def invoice_void(
    id: Annotated[int, Path(ge=1)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(['*:*:*']))],
    data: Annotated[InvoiceVoidSchema, Body()] = InvoiceVoidSchema(),
) -> JSONResponse:
    """
    作废发票

    参数:
    - id (int): 发票 ID。
    - data (InvoiceVoidSchema): 作废原因。

    返回:
    - JSONResponse: 包含发票信息的 JSON 响应。
    """
    result = await InvoicePlatformService.void(auth, id, data)
    return SuccessResponse(data=result, msg="发票已作废")
