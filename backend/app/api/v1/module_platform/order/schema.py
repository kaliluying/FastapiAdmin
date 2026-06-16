"""订单与支付 Schema"""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.core.base_schema import BaseSchema

# ─── Internal Create/Update Schemas（CRUD 层用，字段映射 Model 1:1）───


class OrderCreateInternalSchema(BaseModel):
    """订单创建（内部 CRUD 用，包含所有业务字段）"""
    order_no: str
    tenant_id: int
    package_id: int | None = None
    plugin_id: int | None = None
    order_type: str
    amount: int
    period_count: int = 1
    pay_method: str | None = None
    pay_time: datetime | None = None
    expire_time: datetime
    status: int = 0


class OrderUpdateInternalSchema(BaseModel):
    """订单更新（内部 CRUD 用）"""
    status: int | None = None
    pay_method: str | None = None
    pay_time: datetime | None = None


class PaymentRecordCreateSchema(BaseModel):
    """支付记录创建"""
    order_id: int
    transaction_id: str | None = None
    pay_method: str
    amount: int
    status: int = 1
    raw_response: str | None = None
    pay_time: datetime | None = None


class RefundCreateSchema(BaseModel):
    """退款记录创建"""
    order_id: int
    refund_no: str
    amount: int
    reason: str
    status: int = 1


class RefundUpdateSchema(BaseModel):
    """退款记录更新"""
    status: int | None = None
    reviewer_id: int | None = None
    review_time: datetime | None = None
    reject_reason: str | None = None


# ─── Order ──────────────────────────────────────────────


class OrderCreateSchema(BaseModel):
    """创建订单（套餐或插件）"""
    tenant_id: int
    package_id: int | None = Field(default=None, description="套餐ID（套餐订单必填）")
    plugin_id: int | None = Field(default=None, description="插件ID（插件订单必填）")
    order_type: str = Field(pattern=r"^(new|renew|upgrade|downgrade|plugin)$")
    pay_method: str | None = Field(default=None, pattern=r"^(alipay|wxpay)?$")

    @field_validator("tenant_id")
    @classmethod
    def positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("必须为正整数")
        return v

    @model_validator(mode="after")
    def check_target(self) -> OrderCreateSchema:
        if self.order_type == "plugin":
            if not self.plugin_id or self.plugin_id <= 0:
                raise ValueError("插件订单必须指定 plugin_id")
        else:
            if not self.package_id or self.package_id <= 0:
                raise ValueError("套餐订单必须指定 package_id")
        return self


class OrderOutSchema(BaseSchema):
    """订单输出"""
    order_no: str
    tenant_id: int
    package_id: int | None = None
    plugin_id: int | None = None
    order_type: str
    amount: int
    period_count: int
    pay_method: str | None = None
    pay_time: datetime | None = None
    expire_time: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderQueryParam(BaseModel):
    """订单查询参数"""
    tenant_id: int | None = None
    status: int | None = None
    order_type: str | None = None


# ─── Payment ────────────────────────────────────────────

class PaymentCallbackSchema(BaseModel):
    """支付回调数据"""
    transaction_id: str | None = None
    amount: int
    order_id: int | None = None
    raw_data: dict | None = None


class PaymentRecordOutSchema(BaseSchema):
    """支付记录输出"""
    order_id: int
    transaction_id: str | None = None
    pay_method: str
    amount: int
    pay_time: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class PaymentCreateOut(BaseModel):
    """创建支付结果"""
    pay_url: str
    qr_code_url: str
    trade_no: str
    order_id: int
    order_no: str
    amount: int


class PaymentStatusOut(BaseModel):
    """支付状态查询结果"""
    exists: bool
    order_id: int | None = None
    status: int | None = None
    paid: bool = False
    pay_method: str | None = None
    pay_time: str | None = None


class OrderStatusMessage(BaseModel):
    """订单/退款操作结果消息"""
    id: int
    status: int
    message: str


# ─── Refund ─────────────────────────────────────────────

class RefundApplySchema(BaseModel):
    """退款申请"""
    reason: str = Field(min_length=1, max_length=500)


class RefundReviewSchema(BaseModel):
    """退款审核"""
    reject_reason: str | None = Field(default=None, max_length=500)


class RefundOutSchema(BaseSchema):
    """退款记录输出"""
    order_id: int
    refund_no: str
    amount: int
    reason: str
    refund_transaction_id: str | None = None
    reviewer_id: int | None = None
    review_time: datetime | None = None
    reject_reason: str | None = None

    model_config = ConfigDict(from_attributes=True)
