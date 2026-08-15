"""Resolve client addresses without trusting arbitrary forwarding headers."""

from __future__ import annotations

import ipaddress

from fastapi import Request

from app.config.setting import settings


def _is_trusted_proxy(address: str | None) -> bool:
    """Return whether an address belongs to a configured proxy network.

    Args:
        address: IPv4 or IPv6 address of the direct peer or a forwarding hop.

    Returns:
        ``True`` only when the address matches ``TRUSTED_PROXY_IPS``.
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
    """Resolve the client IP using forwarding headers only via trusted proxies.

    Args:
        request: Incoming HTTP request.

    Returns:
        The best-effort client IP, falling back to the direct peer address.
    """
    direct_peer = request.client.host if request.client else "127.0.0.1"
    if not _is_trusted_proxy(direct_peer):
        return direct_peer

    forwarded = request.headers.get("X-Forwarded-For", "")
    chain = [item.strip() for item in forwarded.split(",") if item.strip()]
    # Walk from the direct peer toward the client. The first untrusted hop is
    # the client address; this also avoids accepting a user-supplied prefix
    # before the proxy's appended address.
    for candidate in reversed([*chain, direct_peer]):
        if not _is_trusted_proxy(candidate):
            try:
                ipaddress.ip_address(candidate)
            except ValueError:
                return direct_peer
            return candidate
    return direct_peer


__all__ = ["get_client_ip"]
