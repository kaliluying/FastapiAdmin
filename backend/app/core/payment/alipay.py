"""支付宝支付网关

依赖 cryptography（已在 pyproject.toml 中）进行 RSA 签名验签。
"""
from __future__ import annotations

import json
from datetime import datetime
from typing import Any
from urllib.parse import urlencode

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

from app.config.setting import settings

from .base import BasePaymentGateway, CallbackResult, PaymentInfo


class AlipayGateway(BasePaymentGateway):
    """支付宝支付网关（App 支付 / 网站支付 / Native 扫码）"""

    GATEWAY_URL = "https://openapi.alipay.com/gateway.do"
    DEV_GATEWAY_URL = "https://openapi-sandbox.dl.alipaydev.com/gateway.do"

    def __init__(self) -> None:
        self.app_id = settings.PAYMENT_ALIPAY_APP_ID or ""
        self._private_key = (settings.PAYMENT_ALIPAY_PRIVATE_KEY or "").encode()
        self._alipay_public_key = (settings.PAYMENT_ALIPAY_PUBLIC_KEY or "").encode()
        self.is_sandbox = settings.PAYMENT_ALIPAY_SANDBOX
        self._gateway = self.DEV_GATEWAY_URL if self.is_sandbox else self.GATEWAY_URL

    def _sign(self, params: dict[str, Any]) -> str:
        """RSA2 签名"""
        sorted_params = sorted((k, v) for k, v in params.items() if v != "" and v is not None)
        sign_str = "&".join(f"{k}={v}" for k, v in sorted_params)

        private_key_obj = serialization.load_pem_private_key(
            self._private_key,
            password=None,
        )
        if not isinstance(private_key_obj, rsa.RSAPrivateKey):
            raise TypeError("私钥类型不是 RSA")

        signature = private_key_obj.sign(
            sign_str.encode("utf-8"),
            padding.PKCS1v15(),
            hashes.SHA256(),
        )
        import base64
        return base64.b64encode(signature).decode("utf-8")

    def _verify(self, params: dict[str, Any], signature: str) -> bool:
        """验证 RSA2 签名"""
        sorted_params = sorted(
            (k, v) for k, v in params.items()
            if k != "sign" and k != "sign_type" and v != "" and v is not None
        )
        sign_str = "&".join(f"{k}={v}" for k, v in sorted_params)

        try:
            public_key_obj = serialization.load_pem_public_key(self._alipay_public_key)
            if not isinstance(public_key_obj, rsa.RSAPublicKey):
                return False

            import base64
            public_key_obj.verify(
                base64.b64decode(signature),
                sign_str.encode("utf-8"),
                padding.PKCS1v15(),
                hashes.SHA256(),
            )
            return True
        except Exception:
            return False

    async def create_payment(
        self, order_no: str, amount: int, subject: str, notify_url: str
    ) -> PaymentInfo:
        """创建支付宝支付（返回 H5 支付页面 URL）"""
        biz_content = json.dumps({
            "out_trade_no": order_no,
            "total_amount": f"{amount / 100:.2f}",
            "subject": subject,
            "product_code": "FAST_INSTANT_TRADE_PAY",
        }, ensure_ascii=False)

        params = {
            "app_id": self.app_id,
            "method": "alipay.trade.page.pay",
            "format": "JSON",
            "charset": "utf-8",
            "sign_type": "RSA2",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "version": "1.0",
            "notify_url": notify_url,
            "biz_content": biz_content,
        }
        params["sign"] = self._sign(params)

        pay_url = f"{self._gateway}?{urlencode(params)}"
        return PaymentInfo(pay_url=pay_url, trade_no="", raw=params)

    async def verify_callback(self, data: dict[str, Any]) -> CallbackResult:
        """验证支付宝异步通知回调"""
        sign = data.pop("sign", "")
        _ = data.pop("sign_type", "")  # noqa

        verified = self._verify(data, sign) if sign else False

        if verified and data.get("trade_status") in ("TRADE_SUCCESS", "TRADE_FINISHED"):
            return CallbackResult(
                verified=True,
                transaction_id=data.get("trade_no"),
                order_id=None,  # 由调用方从 out_trade_no 解析
                amount=int(float(data.get("total_amount", 0)) * 100),
                raw=data,
            )

        return CallbackResult(verified=False, raw=data)
