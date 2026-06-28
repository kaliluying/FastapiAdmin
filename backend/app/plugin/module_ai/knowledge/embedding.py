from typing import Protocol

import anyio
from fastembed import TextEmbedding
from openai import AsyncOpenAI

from app.config.setting import settings


class EmbeddingClient(Protocol):
    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Return one embedding vector per input text."""


class LocalFastEmbedEmbeddingClient:
    """Local embedding client backed by fastembed."""

    def __init__(self, model_name: str | None = None) -> None:
        self.model_name = model_name or settings.LOCAL_EMBEDDING_MODEL
        if not self.model_name.strip():
            raise ValueError("LOCAL_EMBEDDING_MODEL is not configured")
        self.model = TextEmbedding(model_name=self.model_name, cache_dir=settings.LOCAL_EMBEDDING_CACHE_DIR)

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        return await anyio.to_thread.run_sync(self._embed_texts_sync, texts)

    def _embed_texts_sync(self, texts: list[str]) -> list[list[float]]:
        vectors = list(self.model.embed(texts))
        embeddings = [vector.tolist() if hasattr(vector, "tolist") else list(vector) for vector in vectors]
        _validate_embeddings(embeddings, len(texts))
        return embeddings


class OpenAICompatibleEmbeddingClient:
    """Embedding client for OpenAI-compatible providers."""

    def __init__(self) -> None:
        self._validate_config()
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_BASE_URL)

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        response = await self.client.embeddings.create(model=settings.OPENAI_EMBEDDING_MODEL, input=texts)
        embeddings = [item.embedding for item in response.data or [] if getattr(item, "embedding", None)]
        _validate_embeddings(
            embeddings,
            len(texts),
            empty_message=(
                "Embedding service returned no vectors. Check OPENAI_EMBEDDING_MODEL and whether "
                "OPENAI_BASE_URL supports the /embeddings endpoint."
            ),
        )
        return embeddings

    @staticmethod
    def _validate_config() -> None:
        if not settings.OPENAI_API_KEY.strip() or settings.OPENAI_API_KEY.strip() == "your_api_key":
            raise ValueError("OPENAI_API_KEY is not configured")
        if not settings.OPENAI_BASE_URL.strip():
            raise ValueError("OPENAI_BASE_URL is not configured")
        if not settings.OPENAI_EMBEDDING_MODEL.strip() or settings.OPENAI_EMBEDDING_MODEL.strip() == "your_embedding_model":
            raise ValueError("OPENAI_EMBEDDING_MODEL is not configured")


def create_embedding_client(provider: str | None = None) -> EmbeddingClient:
    selected = (provider or settings.EMBEDDING_PROVIDER or "local").strip().lower()
    if selected == "local":
        return LocalFastEmbedEmbeddingClient()
    if selected in {"openai", "remote"}:
        return OpenAICompatibleEmbeddingClient()
    raise ValueError("EMBEDDING_PROVIDER must be 'local' or 'openai'")


def _validate_embeddings(
    embeddings: list[list[float]],
    expected_count: int,
    *,
    empty_message: str = "Embedding service returned no vectors",
) -> None:
    if not embeddings:
        raise ValueError(empty_message)
    if len(embeddings) != expected_count:
        raise ValueError(f"Embedding service returned {len(embeddings)} vectors for {expected_count} texts")
