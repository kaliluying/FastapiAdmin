"""支付网关抽象基类"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class PaymentInfo:
    """支付信息 — 创建支付后返回"""
    pay_url: str | None = None          # H5 跳转 URL
    qr_code_url: str | None = None      # Native 二维码 URL
    trade_no: str = ""                  # 网关交易号
    raw: dict[str, Any] = field(default_factory=dict)  # 原始响应


@dataclass
class CallbackResult:
    """回调验签结果"""
    verified: bool = False               # 验签是否通过
    transaction_id: str | None = None    # 网关交易号
    order_id: int | None = None          # 本系统订单 ID
    amount: int = 0                      # 支付金额（分）
    raw: dict[str, Any] = field(default_factory=dict)  # 原始回调数据


class BasePaymentGateway(ABC):
    """支付网关抽象基类

    所有支付渠道（Alipay、WxPay、Mock）需实现此接口。
    """

    @abstractmethod
    async def create_payment(self, order_no: str, amount: int, subject: str, notify_url: str) -> PaymentInfo:
        """创建支付

        参数:
            order_no: 本系统订单号
            amount: 金额（分）
            subject: 商品描述
            notify_url: 异步通知回调 URL

        返回:
            PaymentInfo: 支付信息（支付 URL / 二维码等）
        """
        ...

    @abstractmethod
    async def verify_callback(self, data: dict[str, Any]) -> CallbackResult:
        """验证异步通知回调签名

        参数:
            data: 回调原始数据

        返回:
            CallbackResult: 验签结果
        """
        ...
