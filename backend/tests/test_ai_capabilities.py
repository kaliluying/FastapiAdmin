import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from anthropic import AsyncAnthropic
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI

from app.plugin.module_ai.chat import capabilities, model_config_service, rag, usage
from app.plugin.module_ai.chat.schema import AiModelConfigUpdateSchema

pytest_plugins = ("ai_usage_fixtures",)


def response_payload(protocol, tool=False):
    if protocol == "anthropic":
        content = [{"type": "tool_use", "id": "probe-call", "name": "capability_probe", "input": {"value": "probe-ok"}}] if tool else [{"type": "text", "text": "probe-ok"}]
        return {"id": "msg-probe", "type": "message", "role": "assistant", "model": "fixture", "content": content, "stop_reason": "tool_use" if tool else "end_turn", "usage": {"input_tokens": 2, "output_tokens": 3}}
    if protocol == "openai_responses":
        output = [{"type": "function_call", "id": "fc-probe", "call_id": "probe-call", "name": "capability_probe", "arguments": '{"value":"probe-ok"}', "status": "completed"}] if tool else [{"type": "message", "id": "msg-probe", "status": "completed", "role": "assistant", "content": [{"type": "output_text", "text": "probe-ok", "annotations": []}]}]
        return {"id": "resp-probe", "object": "response", "status": "completed", "created_at": 0, "model": "fixture", "output": output, "usage": {"input_tokens": 2, "output_tokens": 3, "total_tokens": 5}}
    message = {"role": "assistant", "content": None if tool else "probe-ok"}
    if tool:
        message["tool_calls"] = [{"id": "probe-call", "type": "function", "function": {"name": "capability_probe", "arguments": '{"value":"probe-ok"}'}}]
    return {"id": "chat-probe", "object": "chat.completion", "created": 0, "model": "fixture", "choices": [{"index": 0, "message": message, "finish_reason": "tool_calls" if tool else "stop"}], "usage": {"prompt_tokens": 2, "completion_tokens": 3, "total_tokens": 5}}


def stream_events(protocol):
    if protocol == "anthropic":
        message = response_payload(protocol)
        message["content"] = []
        return [
            {"type": "message_start", "message": message},
            {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}},
            {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "probe-ok"}},
            {"type": "content_block_stop", "index": 0},
            {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": None}, "usage": {"input_tokens": 2, "output_tokens": 3}},
            {"type": "message_stop"},
        ]
    if protocol == "openai_responses":
        return [
            {"type": "response.created", "response": response_payload(protocol), "sequence_number": 0},
            {"type": "response.output_text.delta", "delta": "probe-ok", "output_index": 0, "content_index": 0, "item_id": "msg-probe", "sequence_number": 1},
            {"type": "response.completed", "response": response_payload(protocol), "sequence_number": 2},
        ]
    base = {"id": "chat-probe", "object": "chat.completion.chunk", "created": 0, "model": "fixture"}
    return [{**base, "choices": [{"index": 0, "delta": {"role": "assistant", "content": "probe-ok"}, "finish_reason": None}]},
        {**base, "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}]},
        {**base, "choices": [], "usage": {"prompt_tokens": 2, "completion_tokens": 3, "total_tokens": 5}}]


@pytest.mark.parametrize("protocol", ["openai", "openai_responses", "anthropic"])
async def test_capability_check_real_sdk_http_sse_and_three_records(monkeypatch, usage_storage, protocol):
    requests = []
    config = model_config_service.ChatModelRuntimeConfig(protocol, "https://fixture.invalid/v1", "fixture", "synthetic-key")
    monkeypatch.setattr(capabilities, "load_runtime_chat_model_config", AsyncMock(return_value=config))
    monkeypatch.setattr(capabilities, "validate_model_base_url", lambda value, **kwargs: value)
    def transport(request):
        body = json.loads(request.content)
        requests.append(body)
        if body.get("stream"):
            content = "".join((f"event: {event['type']}\n" if protocol == "anthropic" else "") + f"data: {json.dumps(event)}\n\n" for event in stream_events(protocol))
            if protocol == "openai":
                content += "data: [DONE]\n\n"
            return httpx.Response(200, headers={"content-type": "text/event-stream"}, content=content)
        return httpx.Response(200, json=response_payload(protocol, tool=bool(body.get("tools"))))
    async with httpx.AsyncClient(transport=httpx.MockTransport(transport)) as client:
        monkeypatch.setattr(rag, "ChatOpenAI", lambda **kwargs: ChatOpenAI(http_async_client=client, **kwargs))
        def anthropic_model(**kwargs):
            model = ChatAnthropic(**kwargs)
            model._async_client = AsyncAnthropic(api_key="synthetic-key", base_url=config.base_url, http_client=client, max_retries=0)
            return model
        monkeypatch.setattr(rag, "ChatAnthropic", anthropic_model)
        result = await capabilities.check_model_capabilities(SimpleNamespace(user=SimpleNamespace(id=1), db=SimpleNamespace(rollback=AsyncMock())),
            AiModelConfigUpdateSchema(chat_protocol=protocol, openai_base_url=config.base_url, openai_model="fixture"))
    assert [row["status"] for row in result["results"]] == ["passed"] * 3
    assert len(requests) == 3 and requests[1]["stream"] is True and "capability_probe" in json.dumps(requests[2]["tools"])
    summary = await usage.usage_summary(1, usage.usage_day())
    assert summary["calls"] == 3
    assert all(row["purpose"] == "capability_check" and row["status"] == "succeeded" for row in summary["items"])
    assert sum(row["total_tokens"] for row in summary["items"]) == 15


async def test_check_masks_errors_and_timeout(monkeypatch, usage_storage):
    config = model_config_service.ChatModelRuntimeConfig("openai", "https://fixture.invalid/v1", "fixture", "synthetic-key")
    monkeypatch.setattr(capabilities, "load_runtime_chat_model_config", AsyncMock(return_value=config))
    monkeypatch.setattr(capabilities, "validate_model_base_url", lambda value, **kwargs: value)
    class Model:
        def __init__(self, config):
            pass
        async def complete(self, prompt):
            raise RuntimeError("secret credential must not leak")
        async def stream(self, prompt):
            raise TimeoutError("secret credential must not leak")
            yield ""
        async def request_tools(self, messages, tools):
            return SimpleNamespace(invalid_tool_calls=[], tool_calls=[])
    monkeypatch.setattr(capabilities, "LangChainChatModel", Model)
    result = await capabilities.check_model_capabilities(SimpleNamespace(user=SimpleNamespace(id=1), db=SimpleNamespace(rollback=AsyncMock())),
        AiModelConfigUpdateSchema(openai_base_url=config.base_url, openai_model="fixture"))
    assert [row["status"] for row in result["results"]] == ["failed"] * 3
    assert "secret" not in json.dumps(result) and result["results"][1]["message"] == "验证超时"


@pytest.mark.parametrize("suffix", ["?token=synthetic", "#fragment"])
async def test_capability_endpoint_rejects_url_query_and_fragment(monkeypatch, suffix):
    from app.core.exceptions import CustomException
    config = model_config_service.ChatModelRuntimeConfig("openai", "https://fixture.invalid/v1", "fixture", "synthetic-key")
    monkeypatch.setattr(capabilities, "load_runtime_chat_model_config", AsyncMock(return_value=config))
    monkeypatch.setattr(capabilities, "validate_model_base_url", lambda value, **kwargs: value)
    provider = AsyncMock()
    monkeypatch.setattr(capabilities, "LangChainChatModel", provider)
    with pytest.raises(CustomException, match="查询参数或片段"):
        await capabilities.check_model_capabilities(SimpleNamespace(user=SimpleNamespace(id=1), db=SimpleNamespace(rollback=AsyncMock())),
            AiModelConfigUpdateSchema(openai_base_url=config.base_url + suffix, openai_model="fixture", openai_api_key="synthetic-key"))
    provider.assert_not_called()
