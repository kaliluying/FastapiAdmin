from typing import Annotated, Any, Literal

from fastapi import APIRouter, Depends, Path, Query

from app.common.response import SuccessResponse
from app.core.base_schema import AuthSchema
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import AnswerFeedbackSchema, EvaluationSchema, FeedbackReviewSchema
from .service import QualityService

QualityRouter = APIRouter(prefix="/quality", tags=["AI质量"], route_class=OperationLogRoute)
ChatAuth = Annotated[AuthSchema, Depends(AuthPermission(["module_ai:chat:ws"]))]
RetrievalAuth = Annotated[AuthSchema, Depends(AuthPermission(["module_ai:retrieval:test"]))]


@QualityRouter.post("/feedback", summary="评价自己的已保存回答", openapi_extra={"x-audit-payload": False})
async def submit_feedback(data: AnswerFeedbackSchema, auth: ChatAuth) -> Any:
    return SuccessResponse(data=await QualityService(auth).submit_feedback(data), msg="反馈已保存")


@QualityRouter.get("/feedback", summary="查看回答反馈", openapi_extra={"x-audit-payload": False})
async def list_feedback(
    auth: ChatAuth,
    session_id: Annotated[str | None, Query(max_length=64)] = None,
    all_users: bool = False,
    page_no: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    status: Literal["pending", "resolved"] | None = None,
) -> Any:
    return SuccessResponse(data=await QualityService(auth).list_feedback(session_id=session_id, all_users=all_users, page_no=page_no, page_size=page_size, status=status))


@QualityRouter.put("/feedback/{id}", summary="管理员处理反馈", openapi_extra={"x-audit-payload": False})
async def review_feedback(id: Annotated[int, Path(gt=0)], data: FeedbackReviewSchema, auth: RetrievalAuth) -> Any:
    return SuccessResponse(data=await QualityService(auth).review_feedback(id, data), msg="处理结果已保存")


@QualityRouter.post("/evaluation", summary="批量评测知识检索", openapi_extra={"x-audit-payload": False})
async def evaluate(data: EvaluationSchema, auth: RetrievalAuth) -> Any:
    return SuccessResponse(data=await QualityService(auth).evaluate(data), msg="评测完成")


@QualityRouter.get("/evaluation", summary="查看本人的评测历史", openapi_extra={"x-audit-payload": False})
async def list_evaluations(auth: RetrievalAuth, page_no: Annotated[int, Query(ge=1)] = 1, page_size: Annotated[int, Query(ge=1, le=100)] = 20) -> Any:
    return SuccessResponse(data=await QualityService(auth).list_evaluations(page_no, page_size))
