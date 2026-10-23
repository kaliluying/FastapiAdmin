from pydantic import BaseModel, Field


class LoginTrendItem(BaseModel):
    """单日登录趋势统计。"""

    day: str = Field(..., description="自然日，格式 YYYY-MM-DD")
    logins: int = Field(default=0, ge=0, description="成功登录次数")
    unique_users: int = Field(default=0, ge=0, description="成功登录的独立用户数")
    new_users: int = Field(default=0, ge=0, description="当日新增用户数")


class LoginTrendOut(BaseModel):
    """近七日登录趋势响应。"""

    items: list[LoginTrendItem] = Field(default_factory=list, description="按日期升序排列的统计项")
