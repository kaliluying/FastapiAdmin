from types import SimpleNamespace

from app.plugin.module_ai.chat import model_config_service
from app.plugin.module_ai.chat.schema import AiModelConfigUpdateSchema


class _Result:
    def __init__(self, record) -> None:
        self.record = record

    def scalars(self):
        return self

    def first(self):
        return self.record


class _FakeDb:
    def __init__(self) -> None:
        self.record = None

    async def execute(self, _statement):
        return _Result(self.record)

    def add(self, record) -> None:
        self.record = record

    async def flush(self) -> None:
        return None


async def test_update_model_config_encrypts_key_and_keeps_vector_settings_read_only(monkeypatch) -> None:
    import socket

    monkeypatch.setattr(
        "app.plugin.module_ai.config.socket.getaddrinfo",
        lambda *_args, **_kwargs: [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("93.184.216.34", 443))],
    )
    monkeypatch.setattr(model_config_service, "_active_config", None)
    monkeypatch.setattr(model_config_service.settings, "OPENAI_API_KEY", "env-key")
    monkeypatch.setattr(model_config_service.settings, "OPENAI_BASE_URL", "https://embedding.example/v1")
    monkeypatch.setattr(model_config_service.settings, "OPENAI_MODEL", "env-chat")
    monkeypatch.setattr(model_config_service.settings, "EMBEDDING_PROVIDER", "local")
    monkeypatch.setattr(model_config_service.settings, "LOCAL_EMBEDDING_MODEL", "bge-small")

    db = _FakeDb()
    auth = SimpleNamespace(db=db, user=SimpleNamespace(id=7))
    result = await model_config_service.update_model_config(
        auth,
        AiModelConfigUpdateSchema(
            chat_protocol="anthropic",
            openai_base_url="https://api.anthropic.com",
            openai_model="claude-sonnet-4-6",
            openai_api_key="claude-secret",
        ),
    )

    assert result.chat_protocol == "anthropic"
    assert result.openai_base_url == "https://api.anthropic.com"
    assert result.openai_model == "claude-sonnet-4-6"
    assert result.openai_api_key_configured is True
    assert result.embedding_provider == "local"
    assert result.local_embedding_model == "bge-small"
    assert db.record is not None
    assert db.record.protocol == "anthropic"
    assert db.record.encrypted_api_key != "claude-secret"
    assert "claude-secret" not in db.record.encrypted_api_key
