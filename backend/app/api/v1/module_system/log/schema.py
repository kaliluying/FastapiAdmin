from fastapi import Query
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.common.enums import QueueEnum
from app.core.base_schema import BaseSchema, UserBySchema
from app.core.validator import DateTimeStr

ALLOWED_REQUEST_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]


class LoginLogCreateSchema(BaseModel):
    """新增登录日志"""

    username: str = Field(..., min_length=1, max_length=64, description="用户名")
    status: int = Field(default=1, ge=1, le=2, description="登录状态(1成功 2失败)")
    login_ip: str | None = Field(default=None, max_length=50, description="登录IP地址")
    login_location: str | None = Field(default=None, max_length=255, description="登录位置")
    request_os: str | None = Field(default=None, max_length=64, description="操作系统")
    request_browser: str | None = Field(default=None, max_length=64, description="浏览器")
    msg: str | None = Field(default=None, max_length=255, description="提示消息")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("用户名不能为空")
        if len(v) > 64:
            raise ValueError("用户名长度不能超过64个字符")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: int) -> int:
        if v not in [1, 2]:
            raise ValueError("登录状态只能为1(成功)或2(失败)")
        return v


class LoginLogOutSchema(LoginLogCreateSchema, BaseSchema, UserBySchema):
    """登录日志响应"""

    model_config = ConfigDict(from_attributes=True)


class LoginLogDetailOutSchema(LoginLogOutSchema):
    """登录日志详情响应"""


class LoginLogQueryParam:
    """登录日志查询参数"""

    def __init__(
        self,
        status: int | None = Query(None, ge=1, le=2, description="登录状态(1成功 2失败)"),
        username: str | None = Query(None, max_length=64, description="用户名"),
        created_time: list[DateTimeStr] | None = Query(
            None,
            description="创建时间范围",
            examples=["2025-01-01 00:00:00", "2025-12-31 23:59:59"],
        ),
    ) -> None:
        if status:
            self.status = (QueueEnum.eq.value, status)
        if username:
            self.username = (QueueEnum.like.value, username)

        if created_time and len(created_time) == 2:
            self.created_time = (QueueEnum.between.value, (created_time[0], created_time[1]))


class OperationLogQueryParam(BaseModel):
    request_path: str | None = Field(None, max_length=255, description="请求路径")
    request_method: str | None = Field(None, description="请求方式")
    username: str | None = Field(None, max_length=64, description="用户名")

    @field_validator("request_method")
    @classmethod
    def validate_request_method(cls, value: str | None) -> str | None:
        if value and value.upper() not in ALLOWED_REQUEST_METHODS:
            raise ValueError(f"请求方式必须是: {', '.join(ALLOWED_REQUEST_METHODS)}")
        return value.upper() if value else None


class OperationLogOutSchema(BaseSchema):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    request_path: str
    request_method: str
    response_code: int
    process_time: str | None = None


class OperationLogDetailOutSchema(OperationLogOutSchema):
    request_payload: str | None = None
    response_json: str | None = None


class OperationLogCreateSchema(BaseModel):
    request_path: str = Field(..., min_length=1, max_length=255, description="请求路径")
    request_method: str = Field(..., description="请求方式")
    request_payload: str | None = Field(None, description="请求体")
    response_code: int = Field(200, ge=100, le=599, description="响应状态码")
    response_json: str | None = Field(None, description="响应体")
    process_time: str | None = Field(None, max_length=20, description="处理时间")

    @field_validator("request_method")
    @classmethod
    def validate_request_method(cls, value: str) -> str:
        upper_value = value.upper()
        if upper_value not in ALLOWED_REQUEST_METHODS:
            raise ValueError(f"请求方式必须是: {', '.join(ALLOWED_REQUEST_METHODS)}")
        return upper_value
