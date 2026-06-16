"""健康检查 Schema"""
from __future__ import annotations

from pydantic import BaseModel


class DependencyStatus(BaseModel):
    """依赖状态"""
    status: str
    latency_ms: float | None = None


class HealthOut(BaseModel):
    """基础健康检查响应"""
    status: str
    timestamp: str
    version: str
    uptime_seconds: float


class ReadinessOut(BaseModel):
    """就绪探针响应"""
    status: str
    timestamp: str
    version: str
    uptime_seconds: float
    dependencies: dict[str, DependencyStatus]
    disk_usage: float
