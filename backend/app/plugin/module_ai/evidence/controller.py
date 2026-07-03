"""Evidence analysis API controller.

Routes are auto-discovered by the plugin dynamic router.
"""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Form, Path, Query, UploadFile
from fastapi.responses import JSONResponse

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_schema import AuthSchema
from app.core.dependencies import get_current_user
from app.core.router_class import OperationLogRoute

from .schema import EvidenceAnalysisOutSchema, EvidenceListOutSchema
from .service import EvidenceService

EvidenceRouter = APIRouter(
    route_class=OperationLogRoute,
    prefix="/evidence",
    tags=["AI", "Evidence Analysis"],
)


@EvidenceRouter.post(
    "/upload-analyze",
    summary="Upload and analyze evidence file",
    response_model=ResponseSchema[EvidenceAnalysisOutSchema],
)
async def upload_analyze_controller(
    file: UploadFile,
    session_id: Annotated[str, Form(min_length=1, description="Chat session ID")],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
    evidence_type: Annotated[str | None, Form(description="Manual evidence type hint")] = None,
) -> JSONResponse:
    result = await EvidenceService(auth).upload_and_analyze(
        session_id=session_id,
        file=file,
        evidence_type=evidence_type,
    )
    return SuccessResponse(data=result, msg="upload and analyze evidence success")


@EvidenceRouter.get(
    "/list",
    summary="List evidence files by session",
    response_model=ResponseSchema[list[EvidenceListOutSchema]],
)
async def list_evidence_controller(
    session_id: Annotated[str, Query(min_length=1, description="Session ID")],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await EvidenceService(auth).list_evidence(session_id=session_id)
    return SuccessResponse(data=result, msg="query evidence list success")


@EvidenceRouter.get(
    "/{evidence_id}",
    summary="Get evidence analysis detail",
    response_model=ResponseSchema[EvidenceAnalysisOutSchema],
)
async def get_evidence_detail_controller(
    evidence_id: Annotated[int, Path(ge=1, description="Evidence file ID")],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await EvidenceService(auth).get_evidence_detail(evidence_id=evidence_id)
    return SuccessResponse(data=result, msg="query evidence detail success")
