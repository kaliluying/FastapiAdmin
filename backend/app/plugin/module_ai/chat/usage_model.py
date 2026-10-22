"""持久化的服务商调用账本与原子化每日调用额度。"""
from datetime import date, datetime

from sqlalchemy import CheckConstraint, Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import MappedBase


class AiUsageQuotaModel(MappedBase):
    __tablename__ = "ai_usage_quota"
    __table_args__ = (CheckConstraint("daily_limit IS NULL OR daily_limit >= 0", name="ck_ai_usage_quota_limit"),)
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    daily_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)


class AiUsageDailyModel(MappedBase):
    __tablename__ = "ai_usage_daily"
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    day: Mapped[date] = mapped_column(Date, primary_key=True)
    calls: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class AiUsageRecordModel(MappedBase):
    __tablename__ = "ai_usage_record"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    day: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    protocol: Mapped[str] = mapped_column(String(32), nullable=False)
    model: Mapped[str] = mapped_column(String(200), nullable=False)
    purpose: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="pending", nullable=False)
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    input_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    output_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
