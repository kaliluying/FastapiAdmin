from dataclasses import dataclass
from typing import Literal

from fastapi import Query
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.base_params import BaseQueryParam
from app.core.base_schema import BaseSchema


class __RESOURCE_CLASS__CreateSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=64)
    order: int = Field(default=0, ge=0, le=999_999)
    status: Literal[0, 1] = 0
    description: str | None = Field(default=None, max_length=500)

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, value):
        return value.strip() if isinstance(value, str) else value


class __RESOURCE_CLASS__UpdateSchema(__RESOURCE_CLASS__CreateSchema):
    """编辑提交完整业务字段；审计字段不能由客户端设置。"""


class __RESOURCE_CLASS__OutSchema(__RESOURCE_CLASS__CreateSchema, BaseSchema):
    created_id: int | None = None
    updated_id: int | None = None
    deleted_id: int | None = None


@dataclass
class __RESOURCE_CLASS__QueryParam(BaseQueryParam):
    name: str | None = Query(None, max_length=64, description="__TITLE__名称")
    status: int | None = Query(None, ge=0, le=1, description="0启用，1停用")

    def __post_init__(self) -> None:
        if self.name:
            self.name = ("like", self.name.strip())
