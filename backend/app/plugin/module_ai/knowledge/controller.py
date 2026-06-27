from typing import Annotated, Any

from fastapi import APIRouter, Body, Depends, Form, Path, UploadFile
from fastapi.responses import JSONResponse

from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_params import PaginationQueryParam
from app.core.base_schema import AuthSchema
from app.core.dependencies import AuthPermission
from app.core.router_class import OperationLogRoute

from .schema import (
    KnowledgeBaseCreateSchema,
    KnowledgeBaseOutSchema,
    KnowledgeBaseQueryParam,
    KnowledgeBaseUpdateSchema,
    KnowledgeDocumentOutSchema,
    KnowledgeDocumentQueryParam,
    RetrievalTestSchema,
)
from .service import KnowledgeService

KnowledgeRouter = APIRouter(route_class=OperationLogRoute, prefix="/knowledge", tags=["AI", "Knowledge"])


@KnowledgeRouter.get(
    "/list",
    summary="List knowledge bases",
    response_model=ResponseSchema[dict[str, Any]],
)
async def list_knowledge_base_controller(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[KnowledgeBaseQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:knowledge:query"]))],
) -> JSONResponse:
    result = await KnowledgeService(auth).page_knowledge_bases(
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result, msg="query knowledge bases success")


@KnowledgeRouter.get(
    "/optionselect",
    summary="List enabled knowledge bases",
    response_model=ResponseSchema[list[KnowledgeBaseOutSchema]],
)
async def list_enabled_knowledge_base_controller(
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:knowledge:query"]))],
) -> JSONResponse:
    result = await KnowledgeService(auth).list_enabled_bases()
    return SuccessResponse(data=result, msg="query enabled knowledge bases success")


@KnowledgeRouter.post(
    "/create",
    summary="Create knowledge base",
    response_model=ResponseSchema[KnowledgeBaseOutSchema],
)
async def create_knowledge_base_controller(
    data: KnowledgeBaseCreateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:knowledge:create"]))],
) -> JSONResponse:
    result = await KnowledgeService(auth).create_knowledge_base(data=data)
    return SuccessResponse(data=result, msg="create knowledge base success")


@KnowledgeRouter.put(
    "/update/{id}",
    summary="Update knowledge base",
    response_model=ResponseSchema[KnowledgeBaseOutSchema],
)
async def update_knowledge_base_controller(
    id: Annotated[int, Path(ge=1)],
    data: KnowledgeBaseUpdateSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:knowledge:update"]))],
) -> JSONResponse:
    result = await KnowledgeService(auth).update_knowledge_base(knowledge_base_id=id, data=data)
    return SuccessResponse(data=result, msg="update knowledge base success")


@KnowledgeRouter.delete(
    "/delete",
    summary="Delete knowledge bases",
    response_model=ResponseSchema[None],
)
async def delete_knowledge_base_controller(
    ids: Annotated[list[int], Body()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:knowledge:delete"]))],
) -> JSONResponse:
    await KnowledgeService(auth).delete_knowledge_base(ids=ids)
    return SuccessResponse(msg="delete knowledge base success")


@KnowledgeRouter.get(
    "/document/list",
    summary="List knowledge documents",
    response_model=ResponseSchema[dict[str, Any]],
)
async def list_document_controller(
    page: Annotated[PaginationQueryParam, Depends()],
    search: Annotated[KnowledgeDocumentQueryParam, Depends()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:document:query"]))],
) -> JSONResponse:
    result = await KnowledgeService(auth).page_documents(
        page_no=page.page_no,
        page_size=page.page_size,
        search=search,
        order_by=page.order_by,
    )
    return SuccessResponse(data=result, msg="query knowledge documents success")


@KnowledgeRouter.post(
    "/document/upload",
    summary="Upload and index knowledge document",
    response_model=ResponseSchema[KnowledgeDocumentOutSchema],
)
async def upload_document_controller(
    knowledge_base_id: Annotated[int, Form(ge=1)],
    file: UploadFile,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:document:create"]))],
) -> JSONResponse:
    result = await KnowledgeService(auth).upload_document(knowledge_base_id=knowledge_base_id, file=file)
    return SuccessResponse(data=result, msg="upload knowledge document success")


@KnowledgeRouter.post(
    "/document/{id}/reindex",
    summary="Reindex knowledge document",
    response_model=ResponseSchema[KnowledgeDocumentOutSchema],
)
async def reindex_document_controller(
    id: Annotated[int, Path(ge=1)],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:document:create"]))],
) -> JSONResponse:
    result = await KnowledgeService(auth).index_document(document_id=id)
    return SuccessResponse(data=result, msg="reindex knowledge document success")


@KnowledgeRouter.delete(
    "/document/delete",
    summary="Delete knowledge documents",
    response_model=ResponseSchema[None],
)
async def delete_document_controller(
    ids: Annotated[list[int], Body()],
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:document:delete"]))],
) -> JSONResponse:
    await KnowledgeService(auth).delete_document(ids=ids)
    return SuccessResponse(msg="delete knowledge document success")


@KnowledgeRouter.post(
    "/retrieval/test",
    summary="Test knowledge retrieval",
    response_model=ResponseSchema[dict[str, Any]],
)
async def retrieval_test_controller(
    data: RetrievalTestSchema,
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_ai:retrieval:test"]))],
) -> JSONResponse:
    result = await KnowledgeService(auth).query_retrieval(data=data)
    return SuccessResponse(data=result, msg="test retrieval success")
