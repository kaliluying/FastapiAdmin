from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator

PositiveId = Annotated[int, Field(gt=0)]


class AnswerFeedbackSchema(BaseModel):
    session_id: str = Field(min_length=1, max_length=64)
    run_id: str = Field(min_length=1, max_length=64)
    rating: Literal["helpful", "incorrect"]
    comment: str = Field(default="", max_length=2000)


class FeedbackReviewSchema(BaseModel):
    status: Literal["pending", "resolved"]
    resolution: str = Field(default="", max_length=2000)
    expected_revision: int = Field(ge=1)

    @field_validator("resolution")
    @classmethod
    def trim_resolution(cls, value: str) -> str:
        return value.strip()


class EvaluationCaseSchema(BaseModel):
    query: str = Field(min_length=1, max_length=1000)
    expected_document_ids: list[PositiveId] = Field(min_length=1, max_length=20)

    @field_validator("query")
    @classmethod
    def validate_query(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("问题不能为空")
        return value.strip()


class EvaluationSchema(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    knowledge_base_ids: list[PositiveId] = Field(min_length=1, max_length=20)
    top_k: int = Field(default=5, ge=1, le=20)
    cases: list[EvaluationCaseSchema] = Field(min_length=1, max_length=20)
