from pydantic import BaseModel, Field

from app.core.base_params import BaseQueryParam
from app.core.base_schema import BaseSchema, UserBySchema


class KnowledgeBaseCreateSchema(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    is_enabled: bool = True
    owner_dept_id: int | None = None


class KnowledgeBaseUpdateSchema(KnowledgeBaseCreateSchema):
    pass


class KnowledgeBaseQueryParam(BaseQueryParam):
    name: str | None = None
    is_enabled: bool | None = None


class KnowledgeBaseOutSchema(KnowledgeBaseCreateSchema, BaseSchema, UserBySchema):
    document_count: int = 0


class KnowledgeDocumentQueryParam(BaseQueryParam):
    knowledge_base_id: int | None = None
    file_name: str | None = None
    parse_status: str | None = None
    index_status: str | None = None


class KnowledgeDocumentOutSchema(BaseSchema, UserBySchema):
    knowledge_base_id: int
    file_name: str
    file_path: str | None = None
    file_type: str
    file_size: int = 0
    parse_status: str
    index_status: str
    error_message: str | None = None
    chunk_count: int = 0


class RetrievalTestSchema(BaseModel):
    query: str = Field(min_length=1)
    knowledge_base_ids: list[int] = Field(default_factory=list)
    top_k: int = Field(default=5, ge=1, le=20)
