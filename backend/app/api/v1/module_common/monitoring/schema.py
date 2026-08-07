from pydantic import BaseModel, Field


class DependencyStatus(BaseModel):
    """依赖状态"""

    status: int = Field(..., description="状态(0:异常 1:正常)")
    enabled: bool = Field(default=True, description="是否启用该依赖")
    latency_ms: float | None = Field(default=None, description="延迟(毫秒)")


class HealthOut(BaseModel):
    """基础健康检查响应"""

    status: int = Field(..., description="状态(0:异常 1:正常)")
    timestamp: str = Field(..., description="时间戳")
    version: str = Field(..., description="版本号")
    uptime_seconds: float = Field(..., description="运行时间(秒)")


class ReadinessOut(BaseModel):
    """就绪探针响应"""

    status: int = Field(..., description="状态(0:异常 1:正常)")
    timestamp: str = Field(..., description="时间戳")
    version: str = Field(..., description="版本号")
    uptime_seconds: float = Field(..., description="运行时间(秒)")
    dependencies: dict[str, DependencyStatus] = Field(..., description="依赖状态")
    disk_usage: float = Field(..., description="磁盘使用率")


class LoginTrendItem(BaseModel):
    """单日登录趋势统计。"""

    day: str = Field(..., description="自然日，格式 YYYY-MM-DD")
    logins: int = Field(default=0, ge=0, description="成功登录次数")
    unique_users: int = Field(default=0, ge=0, description="成功登录的独立用户数")
    new_users: int = Field(default=0, ge=0, description="当日新增用户数")


class LoginTrendOut(BaseModel):
    """近七日登录趋势响应。"""

    items: list[LoginTrendItem] = Field(default_factory=list, description="按日期升序排列的统计项")
