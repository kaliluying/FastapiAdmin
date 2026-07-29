"""Runtime settings owned by the optional AI plugin."""

import os
from functools import lru_cache
from typing import Literal

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
