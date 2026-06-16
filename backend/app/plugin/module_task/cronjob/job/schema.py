from fastapi import Query
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)

from app.common.enums import QueueEnum
from app.core.base_schema import BaseSchema


class JobCreateSchema(BaseModel):
    """执行日志创建模型"""

    job_id: str = Field(..., max_length=64, description="任务ID")
    job_name: str | None = Field(default=None, max_length=128, description="任务名称")
    trigger_type: str | None = Field(default=None, max_length=32, description="触发方式")
    status: str = Field(default="pending", max_length=16, description="执行状态")
    next_run_time: str | None = Field(default=None, description="下次执行时间")
    job_state: str | None = Field(default=None, description="任务状态信息")
    result: str | None = Field(default=None, description="执行结果")
    error: str | None = Field(default=None, description="错误信息")

    @field_validator("job_id")
    @classmethod
    def validate_job_id(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1 or len(v) > 64:
            raise ValueError("任务ID长度必须在1-64个字符之间")
        return v

    @field_validator("trigger_type")
    @classmethod
    def validate_trigger_type(cls, v: str | None) -> str | None:
        if v is None:
            return v
        allowed = {"cron", "interval", "date", "manual"}
        v = v.strip()
        if v not in allowed:
            raise ValueError(f"触发方式必须为 {allowed}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"pending", "running", "success", "failed", "timeout", "cancelled"}
        v = v.strip()
        if v not in allowed:
            raise ValueError(f"执行状态必须为 {allowed}")
        return v


class JobUpdateSchema(BaseModel):
    """执行日志更新模型"""

    status: str | None = Field(default=None, max_length=16, description="执行状态")
    next_run_time: str | None = Field(default=None, description="下次执行时间")
    job_state: str | None = Field(default=None, description="任务状态信息")
    result: str | None = Field(default=None, description="执行结果")
    error: str | None = Field(default=None, description="错误信息")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is None:
            return v
        allowed = {"pending", "running", "success", "failed", "timeout", "cancelled"}
        v = v.strip()
        if v not in allowed:
            raise ValueError(f"执行状态必须为 {allowed}")
        return v


class JobOutSchema(JobCreateSchema, BaseSchema):
    """执行日志响应模型"""

    model_config = ConfigDict(from_attributes=True)
    ...


class JobQueryParam:
    """执行日志查询参数"""

    def __init__(
        self,
        job_id: str | None = Query(None, description="任务ID"),
        job_name: str | None = Query(None, description="任务名称"),
        status: str | None = Query(None, description="执行状态"),
        trigger_type: str | None = Query(None, description="触发方式"),
    ) -> None:
        # 确保 job_id 是字符串类型
        self.job_id = (QueueEnum.eq.value, str(job_id) if job_id is not None else None)
        # 只有当 job_name 不为空时才添加查询条件
        self.job_name = (QueueEnum.like.value, job_name) if job_name else None
        self.status = (QueueEnum.eq.value, status)
        self.trigger_type = (QueueEnum.eq.value, trigger_type)
