"""记忆提取器 —— 使用调用方提供的模型从对话中提取关键信息。

每轮对话结束后异步调用，提取置信度低于阈值的内容会被自动跳过。
"""

from __future__ import annotations

import json
from typing import Any, Protocol

from .schema import MemoryExtractAction, MemoryExtractResult


class ExtractionModel(Protocol):
    async def complete(self, prompt: str) -> str:
        """返回用于提取记忆的模型结果。"""

# ── 配置 ──

DEFAULT_CONFIDENCE_THRESHOLD = 0.6  # 低于此阈值的提取结果自动丢弃
MAX_EXISTING_MEMORIES_IN_PROMPT = 20  # 注入到 Prompt 中的已有记忆数量上限

# ── 提取 Prompt ──

_EXTRACT_SYSTEM_PROMPT = """你是记忆提取助手。你的任务是从用户与 AI 助手的对话中，自动提取值得长期记住的信息。

你需要识别三类信息：
- user_preference：用户明确表达的偏好，如「回答要简洁」「用表格展示」
- fact：关于用户的身份、角色、项目背景等客观事实，**这是最常用的类型**
- work_rule：需要 AI 始终遵守的业务规则，如「所有建议必须引用来源」

重要：只要对话中出现了具体的、可验证的事实信息，就应该提取。以下都是应该提取的例子：
- 「我负责系统运维，每周一要出报表」→ fact: key=工作职责, value=负责系统运维，每周一出报表, confidence=0.9
- 「我们项目用 Vue 和 FastAPI」→ fact: key=技术栈, value=Vue 和 FastAPI, confidence=0.85
- 「合同编号是 HT-2026-001」→ fact: key=合同编号, value=HT-2026-001, confidence=0.9
- 「以后回答简洁点」→ user_preference: key=回答风格, value=简洁明了, confidence=0.8
- 「帮我分析一下我的情况」→ 信息不具体，可以不提取

提取规则：
1. 提取对话中明确出现的具体事实（数字、时间、地点、身份等），但不要推测
2. 信息不够具体（如「我有一个问题」没有细节）时，才输出空 actions
3. 已有记忆中已经存在的内容不要重复新增
4. 如果新信息与已有记忆矛盾，使用 update 更新已有记忆
5. 每条 action 必须给出 0-1 的置信度，具体事实给 0.7-0.9，模糊信息给 0.3-0.5

priority 建议：
- 用户明确说「以后都…」「记住…」→ 80-100
- 用户身份、角色信息 → 60-80
- 项目或业务背景信息（时间、地点、编号、角色）→ 50-70
- 一般偏好 → 20-40

输出格式：严格 JSON，不要包含任何额外的解释文字。"""


def _build_extract_prompt(
    user_message: str,
    assistant_response: str,
    existing_memories: list[dict[str, Any]],
) -> str:
    """构建记忆提取的 Prompt。"""
    parts = [_EXTRACT_SYSTEM_PROMPT]

    # 注入已有记忆
    if existing_memories:
        recent = existing_memories[-MAX_EXISTING_MEMORIES_IN_PROMPT:]
        parts.append("\n## 已有记忆（避免重复，如需更新请指定 memory_id）\n")
        for m in recent:
            parts.append(
                f"- [id={m['id']}] {m['memory_type']} | {m['key']}: {m['value']}  (priority={m.get('priority', 0)})"
            )
    else:
        parts.append("\n## 已有记忆\n（无）")

    # 注入本轮对话
    parts.append("\n## 本轮对话\n")
    parts.append(f"用户: {user_message}")
    parts.append(f"助手: {assistant_response[:3000]}")  # 截断过长回复

    # 输出格式要求
    parts.append("""
## 输出格式（严格 JSON）

```json
{
  "actions": [
    {
      "action": "create",
      "memory_type": "fact",
      "key": "用户身份",
      "value": "某公司项目经理，负责交付管理",
      "priority": 70,
      "confidence": 0.9,
      "reason": "用户在对话中明确提到了自己的职位"
    },
    {
      "action": "update",
      "memory_id": 3,
      "key": "回答风格",
      "value": "用表格形式回答，并附上来源引用",
      "priority": 80,
      "confidence": 0.85,
      "reason": "用户表达了对回答格式的新偏好"
    },
    {
      "action": "skip",
      "confidence": 0.0,
      "reason": "没有需要提取的新信息"
    }
  ]
}
```

action 取值：create / update / delete / skip
- create: 新建记忆（不填 memory_id）
- update: 更新已有记忆（必填 memory_id）
- delete: 删除记忆（必填 memory_id）
- skip: 本轮无需操作（actions 可为空数组，或用 skip 占位）

现在请分析以上对话，输出 JSON：""")

    return "\n".join(parts)


def _parse_extract_result(raw: str) -> MemoryExtractResult:
    """解析 LLM 返回的 JSON，容错处理。"""
    text = raw.strip()
    # 去掉可能的 markdown 代码块包裹
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # 尝试找到第一个 { 到最后一个 }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end > start:
            try:
                data = json.loads(text[start:end + 1])
            except json.JSONDecodeError as exc:
                raise ValueError("无法解析记忆提取结果") from exc
        else:
            raise ValueError("记忆提取结果中没有找到 JSON") from None

    if not isinstance(data, dict) or not isinstance(data.get("actions"), list):
        raise ValueError("记忆提取结果缺少 actions 列表")
    return MemoryExtractResult(actions=[MemoryExtractAction(**item) for item in data["actions"]])


class MemoryExtractor:
    """提取并校验记忆动作，不访问会话、数据库或全局模型配置。"""

    def __init__(self, confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD, *, chat_model: ExtractionModel) -> None:
        self.confidence_threshold = confidence_threshold
        self.llm = chat_model

    async def extract_actions(
        self, *, user_message: str, assistant_response: str, existing_memories: list[dict[str, Any]],
    ) -> list[MemoryExtractAction]:
        """调用模型，不持有数据库资源。"""
        prompt = _build_extract_prompt(user_message, assistant_response, existing_memories)
        raw_text = await self.llm.complete(prompt)
        if not isinstance(raw_text, str) or not raw_text.strip():
            raise ValueError("记忆提取返回空内容")
        actions = _parse_extract_result(raw_text).actions
        # 执行任何操作或确认任务完成前，先校验全部结果。
        for action in actions:
            if action.action not in {"create", "update", "delete", "skip"}:
                raise ValueError("记忆提取包含未知操作")
            if action.action in {"create", "update"} and (not (action.key or "").strip() or not (action.value or "").strip()):
                raise ValueError("记忆提取缺少 key/value")
            if action.action == "delete" and (action.memory_id is None or action.memory_id <= 0):
                raise ValueError("记忆删除缺少有效 ID")
        return [
            action for action in actions
            if action.action != "skip" and action.confidence >= self.confidence_threshold
        ]
