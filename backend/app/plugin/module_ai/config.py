"""核心 AI 模块维护的运行设置。"""

import asyncio
import ipaddress
import os
import socket
from functools import lru_cache
from typing import Literal
from urllib.parse import urlparse

from pydantic_settings import BaseSettings, SettingsConfigDict

from app.config.path_conf import BASE_DIR, ENV_DIR


class AiPluginSettings(BaseSettings):
    """作为后端核心的一部分读取 AI 与检索设置。"""

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
    """从与核心服务相同的环境文件构建 AI 设置。

    Returns:
        解析后的 AI 插件设置。
    """
    environment = os.getenv("ENVIRONMENT")
    env_file = ENV_DIR / f".env.{environment}" if environment else ENV_DIR / ".env"
    return AiPluginSettings(_env_file=env_file)


settings = get_ai_plugin_settings()


def validate_model_base_url(value: str, *, resolve_dns: bool = True) -> str:
    """按 SSRF 策略校验模型服务商 URL。

    Args:
        value: 待校验的 HTTP(S) 服务商 URL。

    Returns:
        移除末尾斜杠后的规范化 URL。

    Raises:
        ValueError: URL 包含凭证或指向被禁止的主机时抛出。
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
        addresses = {ipaddress.ip_address(result[4][0]) for result in socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)}
    except (OSError, ValueError) as exc:
        raise ValueError("API 地址主机无法解析") from exc
    if not addresses or any(_is_blocked_address(item) for item in addresses):
        raise ValueError("API 地址不允许解析到本机或内网地址")
    return normalized


async def async_validate_model_base_url(value: str, *, resolve_dns: bool = True) -> str:
    """应用相同的 SSRF 策略，避免 DNS 查询阻塞事件循环。"""
    if not resolve_dns:
        return validate_model_base_url(value, resolve_dns=False)
    return await asyncio.to_thread(validate_model_base_url, value, resolve_dns=True)


def _is_blocked_address(address: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """判断模型端点解析后的地址是否为非公网地址。"""
    return bool(address.is_private or address.is_loopback or address.is_link_local or address.is_reserved or address.is_multicast or address.is_unspecified or not address.is_global)
