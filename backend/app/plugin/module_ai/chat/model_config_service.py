from __future__ import annotations

import base64
import hashlib
from dataclasses import dataclass

from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy import select

from app.config.setting import settings as core_settings
from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.logger import logger
from app.plugin.module_ai.config import settings, validate_model_base_url

from .model import AiModelConfigModel
from .schema import AiModelConfigOutSchema, AiModelConfigUpdateSchema


@dataclass(frozen=True, slots=True)
class ChatModelRuntimeConfig:
    protocol: str
    base_url: str
    model: str
    api_key: str


_active_config: ChatModelRuntimeConfig | None = None


def _fernet() -> Fernet:
    # Derive a stable encryption key from the existing application secret.
    key = base64.urlsafe_b64encode(hashlib.sha256(core_settings.SECRET_KEY.encode("utf-8")).digest())
    return Fernet(key)


def _encrypt_api_key(api_key: str) -> str:
    return _fernet().encrypt(api_key.encode("utf-8")).decode("ascii")


def _decrypt_api_key(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return _fernet().decrypt(value.encode("ascii")).decode("utf-8")
    except (InvalidToken, ValueError, UnicodeDecodeError):
        logger.warning("AI model API key could not be decrypted; falling back to environment configuration")
        return None


def _environment_config() -> ChatModelRuntimeConfig:
    return ChatModelRuntimeConfig(
        protocol="openai",
        # Environment files are deployment-owned configuration. User-edited
        # database values still go through the DNS-aware validator below.
        base_url=validate_model_base_url(settings.OPENAI_BASE_URL, resolve_dns=False) if settings.OPENAI_BASE_URL.strip() else "",
        model=settings.OPENAI_MODEL.strip(),
        api_key=settings.OPENAI_API_KEY.strip(),
    )


def get_active_chat_model_config() -> ChatModelRuntimeConfig:
    return _active_config or _environment_config()


def _apply_record(record: AiModelConfigModel | None) -> ChatModelRuntimeConfig:
    global _active_config
    if record is None:
        _active_config = _environment_config()
        return _active_config

    _active_config = ChatModelRuntimeConfig(
        protocol=record.protocol if record.protocol in {"openai", "anthropic"} else "openai",
        base_url=validate_model_base_url(record.openai_base_url),
        model=record.openai_model.strip(),
        api_key=_decrypt_api_key(record.encrypted_api_key) or _environment_config().api_key,
    )
    return _active_config


async def _find_record(auth: AuthSchema) -> AiModelConfigModel | None:
    db = getattr(auth, "db", None)
    if db is None or not hasattr(db, "execute"):
        return None
    result = await db.execute(select(AiModelConfigModel).where(AiModelConfigModel.is_deleted.is_(False)).order_by(AiModelConfigModel.id.asc()).limit(1))
    return result.scalars().first()


async def load_runtime_chat_model_config(auth: AuthSchema) -> ChatModelRuntimeConfig:
    """Load the persisted override for this process/request, if one exists."""
    record = await _find_record(auth)
    return _apply_record(record)


async def initialize_runtime_chat_model_config() -> ChatModelRuntimeConfig:
    """Load the persisted override during application startup."""
    async with async_db_session() as db:
        async with db.begin():
            auth = AuthSchema(db=db, check_data_scope=False)
            return await load_runtime_chat_model_config(auth)


def _to_output(config: ChatModelRuntimeConfig) -> AiModelConfigOutSchema:
    api_key = config.api_key.strip()
    return AiModelConfigOutSchema(
        chat_protocol=config.protocol,  # type: ignore[arg-type]
        openai_base_url=config.base_url,
        openai_model=config.model,
        openai_embedding_model=settings.OPENAI_EMBEDDING_MODEL,
        embedding_provider=settings.EMBEDDING_PROVIDER,
        local_embedding_model=settings.LOCAL_EMBEDDING_MODEL,
        openai_api_key_configured=bool(api_key and api_key != "your_api_key"),
        chroma_persist_dir=settings.CHROMA_PERSIST_DIR,
        chroma_collection_name=settings.CHROMA_COLLECTION_NAME,
    )


async def get_model_config(auth: AuthSchema) -> AiModelConfigOutSchema:
    return _to_output(await load_runtime_chat_model_config(auth))


async def update_model_config(
    auth: AuthSchema,
    data: AiModelConfigUpdateSchema,
) -> AiModelConfigOutSchema:
    record = await _find_record(auth)
    current = get_active_chat_model_config()
    if record is None:
        record = AiModelConfigModel(
            protocol=data.chat_protocol,
            openai_base_url=validate_model_base_url(data.openai_base_url),
            openai_model=data.openai_model,
            encrypted_api_key=_encrypt_api_key(data.openai_api_key or current.api_key) if (data.openai_api_key or current.api_key) else None,
            created_id=getattr(getattr(auth, "user", None), "id", None),
        )
        auth.db.add(record)
    else:
        record.protocol = data.chat_protocol
        record.openai_base_url = validate_model_base_url(data.openai_base_url)
        record.openai_model = data.openai_model
        if data.openai_api_key:
            record.encrypted_api_key = _encrypt_api_key(data.openai_api_key)
        record.updated_id = getattr(getattr(auth, "user", None), "id", None)

    await auth.db.flush()
    _apply_record(record)
    return _to_output(get_active_chat_model_config())
