"""Real provider SDK parsers over deterministic HTTP SSE, without external calls."""
import json

import httpx
import httpx2
import pytest
from anthropic import AsyncAnthropic
from langchain_core.messages import HumanMessage, message_chunk_to_message
from langchain_openai import ChatOpenAI

from app.plugin.module_ai.chat import model_config_service, rag, runtime_logs

pytest_plugins = ("ai_usage_fixtures",)


def protocol_events(protocol):
    if protocol == "openai":
        deltas = [
            {"role": "assistant", "content": "公开摘要\n"},
            {"tool_calls": [{"index": 0, "id": "call-log", "type": "function",
                             "function": {"name": "query_runtime_logs", "arguments": '{"minutes":'}}]},
            {"tool_calls": [{"index": 0, "function": {"arguments": "30}"}}]},
        ]
        return [{"id": "chat-stream", "object": "chat.completion.chunk", "created": 0, "model": "fixture",
                 "choices": [{"index": 0, "delta": delta, "finish_reason": None}]} for delta in deltas] + [
            {"id": "chat-stream", "object": "chat.completion.chunk", "created": 0, "model": "fixture",
             "choices": [{"index": 0, "delta": {}, "finish_reason": "tool_calls"}]},
            {"id": "chat-stream", "object": "chat.completion.chunk", "created": 0, "model": "fixture",
             "choices": [], "usage": {"prompt_tokens": 2, "completion_tokens": 3, "total_tokens": 5}},
        ]
    if protocol == "anthropic":
        return [
            {"type": "message_start", "message": {"id": "msg-stream", "type": "message", "role": "assistant",
             "model": "fixture", "content": [], "stop_reason": None, "usage": {"input_tokens": 2, "output_tokens": 0}}},
            {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}},
            {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "公开摘要\n"}},
            {"type": "content_block_stop", "index": 0},
            {"type": "content_block_start", "index": 1, "content_block":
             {"type": "tool_use", "id": "call-log", "name": "query_runtime_logs", "input": {}}},
            {"type": "content_block_delta", "index": 1, "delta": {"type": "input_json_delta", "partial_json": '{"minutes":'}},
            {"type": "content_block_delta", "index": 1, "delta": {"type": "input_json_delta", "partial_json": "30}"}},
            {"type": "content_block_stop", "index": 1},
            {"type": "message_delta", "delta": {"stop_reason": "tool_use", "stop_sequence": None},
             "usage": {"input_tokens": 2, "output_tokens": 3}},
            {"type": "message_stop"},
        ]
    function = {"type": "function_call", "id": "fc-log", "call_id": "call-log",
                "name": "query_runtime_logs", "arguments": "", "status": "in_progress"}
    text = {"type": "message", "id": "msg-stream", "role": "assistant", "content": [], "status": "in_progress"}
    response = {"id": "resp-stream", "object": "response", "created_at": 0, "status": "in_progress",
                "model": "fixture", "output": []}
    return [
        {"type": "response.created", "sequence_number": 0, "response": response},
        {"type": "response.output_item.added", "sequence_number": 1, "output_index": 0, "item": text},
        {"type": "response.output_text.delta", "sequence_number": 2, "output_index": 0,
         "content_index": 0, "item_id": "msg-stream", "delta": "公开摘要\n"},
        {"type": "response.output_item.added", "sequence_number": 3, "output_index": 1, "item": function},
        {"type": "response.function_call_arguments.delta", "sequence_number": 4,
         "output_index": 1, "item_id": "fc-log", "delta": '{"minutes":'},
        {"type": "response.function_call_arguments.delta", "sequence_number": 5,
         "output_index": 1, "item_id": "fc-log", "delta": "30}"},
        {"type": "response.completed", "sequence_number": 6, "response": {
            **response, "status": "completed", "output": [
                {**text, "status": "completed", "content": [{"type": "output_text", "text": "公开摘要\n", "annotations": []}]},
                {**function, "arguments": '{"minutes":30}', "status": "completed"},
            ], "usage": {"input_tokens": 2, "output_tokens": 3, "total_tokens": 5},
        }},
    ]


@pytest.mark.parametrize("protocol", ["openai", "openai_responses", "anthropic"])
async def test_real_sdk_tool_stream_merges_text_arguments_and_usage(monkeypatch, usage_storage, protocol):
    http = httpx2 if protocol == "anthropic" else httpx
    requests = []

    def transport(request):
        payload = json.loads(request.content)
        requests.append(payload)
        assert payload["stream"] is True and payload["tools"]
        body = "".join(
            (f"event: {event['type']}\n" if protocol != "openai" else "")
            + f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
            for event in protocol_events(protocol)
        )
        return http.Response(200, headers={"Content-Type": "text/event-stream"}, content=body.encode())

    config = model_config_service.ChatModelRuntimeConfig(
        protocol=protocol, api_key="synthetic-fixture", base_url="https://fixture.invalid", model="fixture",
    )
    async with http.AsyncClient(transport=http.MockTransport(transport)) as client:
        monkeypatch.setattr(rag, "ChatOpenAI", lambda **kwargs: ChatOpenAI(http_async_client=client, **kwargs))
        model = rag.LangChainChatModel(config)
        if protocol == "anthropic":
            model.llm._async_client = AsyncAnthropic(
                api_key="synthetic-fixture", base_url="https://fixture.invalid", http_client=client, max_retries=0,
            )
        chunks = [chunk async for chunk in model.stream_tools([HumanMessage(content="查询日志")], [runtime_logs.RUNTIME_LOG_TOOL])]
    answer = message_chunk_to_message(sum(chunks[1:], chunks[0]))
    assert rag.content_to_text(answer.content) == "公开摘要\n"
    assert answer.tool_calls[0]["id"] == "call-log"
    assert answer.tool_calls[0]["args"] == {"minutes": 30}
    assert answer.usage_metadata["total_tokens"] == 5
    assert len(requests) == 1
