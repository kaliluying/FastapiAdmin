import json
from contextlib import asynccontextmanager
from types import SimpleNamespace
from typing import Any


async def test_websocket_chat_uses_authenticated_service_instance(monkeypatch) -> None:
    from app.plugin.module_ai.chat import ws

    auth = SimpleNamespace(user=SimpleNamespace(username="admin", dept_id=1))

    class FakeTransaction:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

    class FakeDb:
        def begin(self) -> FakeTransaction:
            return FakeTransaction()

    @asynccontextmanager
    async def fake_db_session():
        yield FakeDb()

    async def fake_verify_token(token: str, db: object, redis: object) -> Any:
        assert token == "token"
        return auth

    async def fake_chat_query(self, query):
        assert self.auth is auth
        assert query.message == "hello"
        yield "ok"

    class FakeWebSocket:
        query_params = {"token": "token"}
        app = SimpleNamespace(state=SimpleNamespace(redis=object()))
        client = "test-client"
        state = SimpleNamespace()

        def __init__(self) -> None:
            self.sent: list[str] = []
            self._received = False
            self.closed = False

        async def accept(self) -> None:
            pass

        async def receive_text(self) -> str:
            if self._received:
                raise RuntimeError("stop")
            self._received = True
            return json.dumps({"message": "hello", "session_id": "test_session"})

        async def send_text(self, text: str) -> None:
            self.sent.append(text)

        async def close(self) -> None:
            self.closed = True

    monkeypatch.setattr(ws, "async_db_session", fake_db_session)
    monkeypatch.setattr(ws, "_verify_token", fake_verify_token)
    monkeypatch.setattr(ws.ChatService, "chat_query", fake_chat_query)

    websocket = FakeWebSocket()
    await ws.websocket_chat_controller(websocket)

    assert "ok" in websocket.sent
    assert all("unexpected keyword argument" not in text for text in websocket.sent)


async def test_websocket_chat_commits_message_history_per_received_message(monkeypatch) -> None:
    from app.plugin.module_ai.chat import ws

    class FakeTransaction:
        def __init__(self, db) -> None:
            self.db = db

        async def __aenter__(self):
            self.db.in_transaction = True
            self.db.begin_count += 1
            return self

        async def __aexit__(self, exc_type, exc, tb):
            self.db.in_transaction = False
            if exc_type is None:
                self.db.commit_count += 1
            return False

    class FakeDb:
        def __init__(self) -> None:
            self.in_transaction = False
            self.begin_count = 0
            self.commit_count = 0

        def begin(self) -> FakeTransaction:
            return FakeTransaction(self)

    fake_db = FakeDb()
    auth = SimpleNamespace(user=SimpleNamespace(username="admin", dept_id=1), db=fake_db)

    @asynccontextmanager
    async def fake_db_session():
        yield fake_db

    async def fake_verify_token(token: str, db: object, redis: object) -> Any:
        auth.db = db
        return auth

    async def fake_chat_query(self, query):
        assert self.auth.db.in_transaction is True
        yield "ok"

    class FakeWebSocket:
        query_params = {"token": "token"}
        app = SimpleNamespace(state=SimpleNamespace(redis=object()))
        client = "test-client"
        state = SimpleNamespace()

        def __init__(self) -> None:
            self.sent: list[str] = []
            self._received = False

        async def accept(self) -> None:
            pass

        async def receive_text(self) -> str:
            if self._received:
                raise RuntimeError("stop")
            self._received = True
            return json.dumps({"message": "hello", "session_id": "test_session"})

        async def send_text(self, text: str) -> None:
            self.sent.append(text)

        async def close(self) -> None:
            pass

    monkeypatch.setattr(ws, "async_db_session", fake_db_session)
    monkeypatch.setattr(ws, "_verify_token", fake_verify_token)
    monkeypatch.setattr(ws.ChatService, "chat_query", fake_chat_query)

    websocket = FakeWebSocket()
    await ws.websocket_chat_controller(websocket)

    assert "ok" in websocket.sent
    assert fake_db.begin_count == 1
    assert fake_db.commit_count == 1
