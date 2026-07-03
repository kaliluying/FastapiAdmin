from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from fastapi.responses import JSONResponse, StreamingResponse

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_schema import AuthSchema
from app.core.dependencies import get_current_user
from app.core.router_class import OperationLogRoute

from .schema import (
    ArbitrationCaseOutSchema,
    ArbitrationDraftListItemSchema,
    ArbitrationDraftOutSchema,
    ArbitrationDraftRequestSchema,
)
from .service import ArbitrationDraftService

ArbitrationRouter = APIRouter(
    route_class=OperationLogRoute,
    prefix="/arbitration",
    tags=["AI管理", "仲裁文书"],
)


@ArbitrationRouter.post(
    "/draft",
    summary="生成劳动仲裁申请书草稿",
    response_model=ResponseSchema[ArbitrationDraftOutSchema],
)
async def generate_arbitration_draft_controller(
    data: ArbitrationDraftRequestSchema,
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await ArbitrationDraftService(auth).generate_draft(data)
    return SuccessResponse(data=result, msg="生成仲裁申请书草稿成功")


@ArbitrationRouter.get(
    "/case/list",
    summary="查询仲裁案件列表",
    response_model=ResponseSchema[dict],
)
async def list_arbitration_cases_controller(
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await ArbitrationDraftService(auth).list_cases()
    return SuccessResponse(data=result, msg="查询仲裁案件列表成功")


@ArbitrationRouter.get(
    "/draft/list",
    summary="查询申请书草稿历史",
    response_model=ResponseSchema[dict],
)
async def list_arbitration_drafts_controller(
    auth: Annotated[AuthSchema, Depends(get_current_user)],
    case_id: Annotated[int | None, Query(description="案件 ID")] = None,
) -> JSONResponse:
    result = await ArbitrationDraftService(auth).list_drafts(case_id=case_id)
    return SuccessResponse(data=result, msg="查询申请书草稿历史成功")


@ArbitrationRouter.get(
    "/draft/{draft_id}",
    summary="获取申请书草稿详情",
    response_model=ResponseSchema[ArbitrationDraftOutSchema],
)
async def get_arbitration_draft_controller(
    draft_id: Annotated[int, Path(ge=1, description="草稿 ID")],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await ArbitrationDraftService(auth).get_draft(draft_id=draft_id)
    return SuccessResponse(data=result, msg="获取申请书草稿成功")


@ArbitrationRouter.get(
    "/draft/{draft_id}/export",
    summary="导出申请书草稿",
)
async def export_arbitration_draft_controller(
    draft_id: Annotated[int, Path(ge=1, description="草稿 ID")],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
    file_type: Annotated[str, Query(pattern="^(docx|pdf)$", description="导出类型")] = "docx",
) -> StreamingResponse:
    content = await ArbitrationDraftService(auth).export_draft(draft_id=draft_id, file_type=file_type)
    media_type = (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        if file_type == "docx"
        else "application/pdf"
    )
    filename = f"arbitration-draft-{draft_id}.{file_type}"
    return StreamingResponse(
        iter([content]),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
