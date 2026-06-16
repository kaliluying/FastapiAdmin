"""Mock 支付网关 — 开发/测试用，模拟支付成功"""
from __future__ import annotations

import uuid
from typing import Any

from .base import BasePaymentGateway, CallbackResult, PaymentInfo


class MockPaymentGateway(BasePaymentGateway):
    """Mock 支付网关

    开发模式下使用，无需真实支付渠道配置即可测试完整支付流程。
    - create_payment: 返回模拟的 QR 码/支付 URL
    - verify_callback: 标记为验签通过
    """

    def __init__(self) -> None:
        self._pending_orders: dict[str, dict] = {}

    async def create_payment(
        self, order_no: str, amount: int, subject: str, notify_url: str
    ) -> PaymentInfo:
        trade_no = f"MOCK{uuid.uuid4().hex[:16].upper()}"
        self._pending_orders[order_no] = {
            "trade_no": trade_no,
            "amount": amount,
            "subject": subject,
        }

        # 模拟支付页面（开发环境可用）
        pay_url = f"/mock-pay?order_no={order_no}&amount={amount}"
        qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={pay_url}"

        return PaymentInfo(
            pay_url=pay_url,
            qr_code_url=qr_url,
            trade_no=trade_no,
            raw={"order_no": order_no, "amount": amount, "is_mock": True},
        )

    async def verify_callback(self, data: dict[str, Any]) -> CallbackResult:
        order_no = data.get("order_no", "")
        pending = self._pending_orders.pop(order_no, None)

        if pending:
            return CallbackResult(
                verified=True,
                transaction_id=pending["trade_no"],
                order_id=data.get("order_id"),
                amount=pending["amount"],
                raw={**data, **pending},
            )
        return CallbackResult(
            verified=False,
            raw=data,
        )

    def get_mock_callback_data(self, order_id: int, order_no: str) -> dict:
        """生成模拟回调数据，供开发环境手动触发"""
        pending = self._pending_orders.get(order_no, {})
        return {
            "order_id": order_id,
            "order_no": order_no,
            "trade_no": pending.get("trade_no", f"MOCK{uuid.uuid4().hex[:16].upper()}"),
            "total_amount": str(pending.get("amount", 0) / 100),
            "trade_status": "TRADE_SUCCESS",
        }
