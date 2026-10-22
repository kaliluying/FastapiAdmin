"""Explicit, bounded checks using the application's provider adapter."""
from __future__ import annotations

import asyncio
from time import monotonic
from typing import Any
from urllib.parse import urlsplit

from langchain_core.messages import HumanMessage

from app.core.exceptions import CustomException
from app.plugin.module_ai.config import async_validate_model_base_url, validate_model_base_url

from .model_config_service import ChatModelRuntimeConfig, load_runtime_chat_model_config
from .rag import LangChainChatModel
from .schema import AiModelConfigUpdateSchema
from .usage import usage_context

_PROBE = {
    "name": "capability_probe", "description": "Return the probe value to verify tool calling. This tool has no side effects.",
    "parameters": {"type": "object", "properties": {"value": {"type": "string", "enum": ["probe-ok"]}}, "required": ["value"], "additionalProperties": False},
}


async def check_model_capabilities(auth: Any, data: AiModelConfigUpdateSchema) -> dict[str, Any]:
    current = await load_runtime_chat_model_config(auth)
    same_endpoint = data.openai_base_url == current.base_url
    same_scope = same_endpoint and (data.chat_protocol == current.protocol or {data.chat_protocol, current.protocol} <= {"openai", "openai_responses"})
    key = data.openai_api_key or (current.api_key if same_scope else "")
    if not key or key == "your_api_key":
        raise CustomException(msg="请填写当前接口的 API Key")
    base_url = validate_model_base_url(data.openai_base_url, resolve_dns=False)
    parsed = urlsplit(base_url)
    if parsed.query or parsed.fragment:
        raise CustomException(msg="API 地址不能包含查询参数或片段")
    base_url = await async_validate_model_base_url(base_url, resolve_dns=not same_endpoint)
    config = ChatModelRuntimeConfig(protocol=data.chat_protocol, base_url=base_url, model=data.openai_model, api_key=key)
    # Release configuration-read transactions before independently reserving calls.
    await auth.db.rollback()
    model = LangChainChatModel(config)
    results = []
    async def complete():
        return bool((await model.complete("Reply with exactly: probe-ok")).strip())
    async def stream():
        text = "".join([part async for part in model.stream("Reply with exactly: probe-ok")])
        return bool(text.strip())
    async def tools():
        response = await model.request_tools([HumanMessage(content="Call capability_probe with value probe-ok. Do not answer with text.")], [_PROBE])
        return not response.invalid_tool_calls and any(call.get("name") == "capability_probe" and call.get("args") == {"value": "probe-ok"} for call in response.tool_calls)
    with usage_context(auth.user.id, "capability_check"):
        for name, check in (("complete", complete), ("stream", stream), ("tools", tools)):
            started = monotonic()
            try:
                async with asyncio.timeout(20):
                    passed = await check()
                result = {"capability": name, "status": "passed" if passed else "failed", "message": "验证通过" if passed else "模型未返回预期的有效内容或工具参数"}
            except Exception as exc:
                status = getattr(exc, "status_code", None)
                message = "验证超时" if isinstance(exc, TimeoutError) else f"接口返回 HTTP {status}" if isinstance(status, int) else "接口请求失败，请检查配置与供应商支持情况"
                if isinstance(exc, CustomException):
                    message = exc.msg
                result = {"capability": name, "status": "failed", "message": message}
            result["latency_ms"] = round((monotonic() - started) * 1000)
            results.append(result)
    return {"protocol": config.protocol, "model": config.model, "results": results}
