"""支付网关工厂"""
from __future__ import annotations

from app.config.setting import settings
from app.core.logger import logger

from .alipay import AlipayGateway
from .base import BasePaymentGateway, CallbackResult, PaymentInfo
from .mock import MockPaymentGateway


def create_payment_gateway(method: str = "") -> BasePaymentGateway:
    """创建支付网关实例

    参数:
        method: "alipay" / "wxpay" / ""（根据配置自动选择）

    优先级:
        1. 指定渠道
        2. ALIPAY 配置就绪 → AlipayGateway
        3. 兜底 → MockPaymentGateway
    """
    if method == "alipay":
        logger.info("🔔 使用支付宝支付网关")
        return AlipayGateway()

    if method == "wxpay":
        logger.info("🔔 使用微信支付网关（未实现，回退 Mock）")
        return MockPaymentGateway()

    # 自动检测：如果配置了支付宝密钥则使用真实网关，否则 Mock
    if settings.PAYMENT_ALIPAY_APP_ID and settings.PAYMENT_ALIPAY_PRIVATE_KEY:
        logger.info("🔔 自动选择支付宝支付网关")
        return AlipayGateway()

    logger.info("🔔 使用 Mock 支付网关（开发模式）")
    return MockPaymentGateway()


# 获取当前 Mock 网关（用于开发环境手动触发回调）
_mock_gateway: MockPaymentGateway | None = None


def get_mock_gateway() -> MockPaymentGateway:
    """获取全局 Mock 网关实例（用于开发环境）"""
    global _mock_gateway
    if _mock_gateway is None:
        _mock_gateway = MockPaymentGateway()
    return _mock_gateway


__all__ = [
    "BasePaymentGateway",
    "PaymentInfo",
    "CallbackResult",
    "create_payment_gateway",
    "get_mock_gateway",
]
