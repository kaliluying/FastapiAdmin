"""Runtime settings owned by the optional AI plugin."""

import ipaddress
import os
import socket
from functools import lru_cache
from typing import Literal
from urllib.parse import urlparse

from pydantic_settings import BaseSettings, SettingsConfigDict

from app.config.path_conf import BASE_DIR, ENV_DIR


class AiPluginSettings(BaseSettings):
    """Read AI and retrieval settings without adding them to the core backend."""

    model_config = SettingsConfigDict(env_file_encoding="utf-8", extra="ignore", case_sensitive=True)

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = ""
    OPENAI_EMBEDDING_MODEL: str = ""
    OPENAI_BASE_URL: str = ""
    EMBEDDING_PROVIDER: str = "local"
    LOCAL_EMBEDDING_MODEL: str = "BAAI/bge-small-zh-v1.5"
    LOCAL_EMBEDDING_CACHE_DIR: str = str(BASE_DIR / "data" / "fastembed")
    CHROMA_PERSIST_DIR: str = str(BASE_DIR / "data" / "chroma")
    CHROMA_COLLECTION_NAME: str = "knowledge_base"
    RETRIEVAL_MODE: Literal["vector", "bm25", "hybrid"] = "hybrid"
    HYBRID_ALPHA: float = 0.5
    BM25_INDEX_DIR: str = str(BASE_DIR / "data" / "bm25_index")
    BM25_TOKENIZER: Literal["char", "jieba"] = "jieba"
    RETRIEVAL_TOP_K: int = 5
    RETRIEVAL_CANDIDATE_MULTIPLIER: int = 4
    RETRIEVAL_AUTO_ADJUST_ALPHA: bool = True
    MODEL_ALLOWED_HOSTS: list[str] = []


@lru_cache(maxsize=1)
def get_ai_plugin_settings() -> AiPluginSettings:
    """Build AI settings from the same environment file as the core service.

    Returns:
        Parsed AI plugin settings.
    """
    environment = os.getenv("ENVIRONMENT")
    env_file = ENV_DIR / f".env.{environment}" if environment else ENV_DIR / ".env"
    return AiPluginSettings(_env_file=env_file)


settings = get_ai_plugin_settings()


def validate_model_base_url(value: str, *, resolve_dns: bool = True) -> str:
    """Validate a model provider URL against the SSRF policy.

    Args:
        value: Candidate HTTP(S) provider URL.

    Returns:
        Normalized URL without a trailing slash.

    Raises:
        ValueError: If the URL contains credentials or targets a blocked host.
    """
    normalized = value.strip().rstrip("/")
    parsed = urlparse(normalized)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError("API 地址必须是不包含认证信息的有效 http/https URL")
    hostname = (parsed.hostname or "").lower().rstrip(".")
    if not hostname:
        raise ValueError("API 地址缺少主机名")

    allowed_hosts = {item.strip().lower().rstrip(".") for item in settings.MODEL_ALLOWED_HOSTS if item.strip()}
    if allowed_hosts:
        if hostname not in allowed_hosts:
            raise ValueError("API 地址主机不在允许列表中")
        return normalized

    if hostname in {"localhost", "localhost.localdomain", "ip6-localhost"} or hostname.endswith(".localhost"):
        raise ValueError("API 地址不允许使用本地主机")
    try:
        address = ipaddress.ip_address(hostname)
    except ValueError:
        address = None

    if address is not None:
        if _is_blocked_address(address):
            raise ValueError("API 地址不允许指向本机或内网地址")
        return normalized

    if not resolve_dns:
        return normalized

    try:
        addresses = {
            ipaddress.ip_address(result[4][0])
            for result in socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)
        }
    except (OSError, ValueError) as exc:
        raise ValueError("API 地址主机无法解析") from exc
    if not addresses or any(_is_blocked_address(item) for item in addresses):
        raise ValueError("API 地址不允许解析到本机或内网地址")
    return normalized


def _is_blocked_address(address: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """Return whether a resolved model endpoint address is non-public."""
    return bool(
        address.is_private
        or address.is_loopback
        or address.is_link_local
        or address.is_reserved
        or address.is_multicast
        or address.is_unspecified
        or not address.is_global
    )
