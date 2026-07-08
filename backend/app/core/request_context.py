from contextvars import ContextVar, Token
from dataclasses import dataclass
from typing import Any

# ── 日志注入 ──
_correlation_id: ContextVar[str] = ContextVar("correlation_id", default="")


def set_correlation_id(cid: str) -> Token:
    return _correlation_id.set(cid)

def get_correlation_id() -> str:
    return _correlation_id.get()

def reset_correlation_id(token: Token) -> None:
    _correlation_id.reset(token)


# ── request.state.ctx ──

@dataclass
class RequestContext:
    jwt_payload: Any = None
    jwt_user_info: dict[str, Any] | None = None
    session_id: str | None = None
    user_id: int | None = None
    user_username: str | None = None
    session_info: dict[str, Any] | None = None
    login_location: str | None = None
