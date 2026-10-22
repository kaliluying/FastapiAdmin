"""解析客户端地址，仅信任已配置代理提供的转发头。"""

from __future__ import annotations

import ipaddress

from fastapi import Request

from app.config.setting import settings


def _is_trusted_proxy(address: str | None) -> bool:
    """判断地址是否属于已配置的可信代理网段。

    Args:
        address: 直接连接方或转发节点的 IPv4、IPv6 地址。

    Returns:
        仅当地址匹配 ``TRUSTED_PROXY_IPS`` 时返回 ``True``。
    """
    if not address:
        return False
    try:
        parsed = ipaddress.ip_address(address.strip())
    except ValueError:
        return False
    for network in settings.TRUSTED_PROXY_IPS:
        try:
            if parsed in ipaddress.ip_network(network, strict=False):
                return True
        except ValueError:
            continue
    return False


def get_client_ip(request: Request) -> str:
    """仅在请求经过可信代理时使用转发头解析客户端 IP。

    Args:
        request: 当前 HTTP 请求。

    Returns:
        尽可能解析出的客户端 IP；无法解析时使用直接连接方的地址。
    """
    direct_peer = request.client.host if request.client else "127.0.0.1"
    if not _is_trusted_proxy(direct_peer):
        return direct_peer

    forwarded = request.headers.get("X-Forwarded-For", "")
    chain = [item.strip() for item in forwarded.split(",") if item.strip()]
    # 从直接连接方向客户端回溯，将遇到的首个不可信节点视为客户端地址，
    # 避免接受用户在代理追加地址之前伪造的转发头前缀。

    for candidate in reversed([*chain, direct_peer]):
        if not _is_trusted_proxy(candidate):
            try:
                ipaddress.ip_address(candidate)
            except ValueError:
                return direct_peer
            return candidate
    return direct_peer


__all__ = ["get_client_ip"]
