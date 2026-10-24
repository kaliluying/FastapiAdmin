from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class AgentRunCreateSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    request_id: str = Field(min_length=1, max_length=64, pattern=r"^[a-zA-Z0-9_-]+$")
    goal: str = Field(min_length=1, max_length=4000)
    knowledge_base_ids: list[Annotated[int, Field(strict=True, gt=0)]] = Field(default_factory=list, max_length=10)
    use_runtime_logs: bool = Field(default=True, strict=True)

    @field_validator("goal")
    @classmethod
    def clean_goal(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("请输入诊断目标")
        return value.strip()

    @model_validator(mode="after")
    def require_source(self):
        self.knowledge_base_ids = list(dict.fromkeys(self.knowledge_base_ids))
        if not self.use_runtime_logs and not self.knowledge_base_ids:
            raise ValueError("请启用运行日志或选择知识库")
        return self
