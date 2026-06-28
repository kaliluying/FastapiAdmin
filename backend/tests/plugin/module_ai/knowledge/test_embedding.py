from types import SimpleNamespace

import pytest


async def test_create_embedding_client_defaults_to_local_fastembed(monkeypatch) -> None:
    from app.plugin.module_ai.knowledge import embedding

    created: dict[str, object] = {}

    class FakeTextEmbedding:
        def __init__(self, model_name: str, cache_dir: str) -> None:
            created["model_name"] = model_name
            created["cache_dir"] = cache_dir

        def embed(self, texts: list[str]):
            created["texts"] = texts
            return [[0.1, 0.2]]

    monkeypatch.setattr(embedding.settings, "EMBEDDING_PROVIDER", "local")
    monkeypatch.setattr(embedding.settings, "LOCAL_EMBEDDING_MODEL", "BAAI/bge-small-zh-v1.5")
    monkeypatch.setattr(embedding.settings, "LOCAL_EMBEDDING_CACHE_DIR", "./data/fastembed")
    monkeypatch.setattr(embedding, "TextEmbedding", FakeTextEmbedding)

    client = embedding.create_embedding_client()
    assert await client.embed_texts(["hello"]) == [[0.1, 0.2]]
    assert created == {
        "model_name": "BAAI/bge-small-zh-v1.5",
        "cache_dir": "./data/fastembed",
        "texts": ["hello"],
    }


def test_create_embedding_client_can_select_openai_provider(monkeypatch) -> None:
    from app.plugin.module_ai.knowledge import embedding

    monkeypatch.setattr(embedding.settings, "EMBEDDING_PROVIDER", "openai")
    monkeypatch.setattr(embedding.settings, "OPENAI_API_KEY", "test_key")
    monkeypatch.setattr(embedding.settings, "OPENAI_BASE_URL", "https://example.test/v1")
    monkeypatch.setattr(embedding.settings, "OPENAI_EMBEDDING_MODEL", "embed-test")
    monkeypatch.setattr(embedding, "AsyncOpenAI", lambda **kwargs: SimpleNamespace(embeddings=object()))

    assert isinstance(embedding.create_embedding_client(), embedding.OpenAICompatibleEmbeddingClient)


async def test_embedding_client_reports_empty_provider_data(monkeypatch) -> None:
    from app.plugin.module_ai.knowledge import embedding

    class FakeEmbeddings:
        async def create(self, **kwargs):
            return SimpleNamespace(data=[])

    class FakeClient:
        embeddings = FakeEmbeddings()

    monkeypatch.setattr(embedding.settings, "OPENAI_API_KEY", "test_key")
    monkeypatch.setattr(embedding.settings, "OPENAI_BASE_URL", "https://example.test/v1")
    monkeypatch.setattr(embedding.settings, "OPENAI_EMBEDDING_MODEL", "embed-test")
    monkeypatch.setattr(embedding, "AsyncOpenAI", lambda **kwargs: FakeClient())

    with pytest.raises(ValueError, match="Embedding service returned no vectors"):
        await embedding.OpenAICompatibleEmbeddingClient().embed_texts(["hello"])


async def test_embedding_client_reports_vector_count_mismatch(monkeypatch) -> None:
    from app.plugin.module_ai.knowledge import embedding

    class FakeEmbeddings:
        async def create(self, **kwargs):
            return SimpleNamespace(data=[SimpleNamespace(embedding=[0.1, 0.2])])

    class FakeClient:
        embeddings = FakeEmbeddings()

    monkeypatch.setattr(embedding.settings, "OPENAI_API_KEY", "test_key")
    monkeypatch.setattr(embedding.settings, "OPENAI_BASE_URL", "https://example.test/v1")
    monkeypatch.setattr(embedding.settings, "OPENAI_EMBEDDING_MODEL", "embed-test")
    monkeypatch.setattr(embedding, "AsyncOpenAI", lambda **kwargs: FakeClient())

    with pytest.raises(ValueError, match="Embedding service returned 1 vectors for 2 texts"):
        await embedding.OpenAICompatibleEmbeddingClient().embed_texts(["hello", "world"])
