"""记忆提取器 —— 从对话中自动提取关键信息并写入长期记忆。

每轮对话结束后异步调用，提取置信度低于阈值的内容会被自动跳过。
"""

from __future__ import annotations

import json
from typing import Any

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

from app.config.setting import settings
from app.core.logger import logger
from app.plugin.module_ai.memory.crud import MemoryCRUD
from app.plugin.module_ai.memory.schema import MemoryExtractAction, MemoryExtractResult

# ── 配置 ──

DEFAULT_CONFIDENCE_THRESHOLD = 0.6  # 低于此阈值的提取结果自动丢弃
MAX_EXISTING_MEMORIES_IN_PROMPT = 20  # 注入到 Prompt 中的已有记忆数量上限

# ── 提取 Prompt ──

_EXTRACT_SYSTEM_PROMPT = """你是记忆提取助手。你的任务是从用户与 AI 助手的对话中，自动提取值得长期记住的信息。

你需要识别三类信息：
- user_preference：用户明确表达的偏好，如「回答要简洁」「用表格展示」
- fact：关于用户的身份、角色、案件背景等客观事实，**这是最常用的类型**
- work_rule：需要 AI 始终遵守的业务规则，如「所有建议必须引用法条」

重要：只要对话中出现了具体的、可验证的事实信息，就应该提取。以下都是应该提取的例子：
- 「我的工资 2000 元，拖欠了半年」→ fact: key=工资情况, value=月薪2000元，已拖欠6个月, confidence=0.9
- 「我在深圳某电子厂工作」→ fact: key=工作单位, value=深圳某电子厂, confidence=0.85
- 「我2023年3月入职的」→ fact: key=入职时间, value=2023年3月, confidence=0.9
- 「以后回答简洁点」→ user_preference: key=回答风格, value=简洁明了, confidence=0.8
- 「帮我分析一下我的情况」→ 信息不具体，可以不提取

提取规则：
1. 提取对话中明确出现的具体事实（数字、时间、地点、身份等），但不要推测
2. 信息不够具体（如「我有劳动争议」没有细节）时，才输出空 actions
3. 已有记忆中已经存在的内容不要重复新增
4. 如果新信息与已有记忆矛盾，使用 update 更新已有记忆
5. 每条 action 必须给出 0-1 的置信度，具体事实给 0.7-0.9，模糊信息给 0.3-0.5

priority 建议：
- 用户明确说「以后都…」「记住…」→ 80-100
- 用户身份、角色信息 → 60-80
- 案件背景信息（工资、时间、地点）→ 50-70
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
      "value": "某公司 HR 经理，负责工伤处理",
      "priority": 70,
      "confidence": 0.9,
      "reason": "用户在对话中明确提到了自己的职位"
    },
    {
      "action": "update",
      "memory_id": 3,
      "key": "回答风格",
      "value": "用表格形式回答，并附上法条引用",
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
            except json.JSONDecodeError:
                logger.warning(f"无法解析记忆提取结果: {raw[:200]}")
                return MemoryExtractResult(actions=[])
        else:
            logger.warning(f"记忆提取结果中没有找到 JSON: {raw[:200]}")
            return MemoryExtractResult(actions=[])

    raw_actions = data.get("actions", [])
    actions: list[MemoryExtractAction] = []
    for item in raw_actions:
        try:
            actions.append(MemoryExtractAction(**item))
        except Exception as e:
            logger.warning(f"跳过无效的记忆提取 action: {item}, error={e}")
    return MemoryExtractResult(actions=actions)


class MemoryExtractor:
    """从对话中提取长期记忆并写入数据库。"""

    def __init__(self, confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD) -> None:
        self.confidence_threshold = confidence_threshold
        self._llm: ChatOpenAI | None = None

    @property
    def llm(self) -> ChatOpenAI:
        if self._llm is None:
            self._llm = ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL,
                model=settings.OPENAI_MODEL,
                temperature=0.3,  # 低温度让输出更稳定
            )
        return self._llm

    async def extract_and_save(
        self,
        *,
        crud: MemoryCRUD,
        user_message: str,
        assistant_response: str,
    ) -> int:
        """提取记忆并写入数据库，返回实际保存的条数。

        流程：
        1. 拉取当前用户的已有记忆
        2. 构建 Prompt 并调用 LLM
        3. 过滤低置信度结果
        4. 执行 create/update/delete 操作
        """
        try:
            # 1. 拉取已有记忆
            existing = await crud.get_active_memories()
            existing_dicts = [m.to_dict() for m in existing]

            # 2. 调用 LLM 提取
            prompt = _build_extract_prompt(
                user_message=user_message,
                assistant_response=assistant_response,
                existing_memories=existing_dicts,
            )
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            raw_text = response.content
            if isinstance(raw_text, list):
                raw_text = "".join(str(part) for part in raw_text)
            if not isinstance(raw_text, str) or not raw_text.strip():
                logger.info("记忆提取: LLM 返回空内容，跳过")
                return 0

            result = _parse_extract_result(raw_text)

            # 3. 过滤低置信度
            valid_actions = [
                a for a in result.actions
                if a.action != "skip" and a.confidence >= self.confidence_threshold
            ]
            if not valid_actions:
                logger.info(
                    f"记忆提取: {len(result.actions)} 条候选，"
                    f"过滤后 0 条（阈值={self.confidence_threshold}），跳过"
                )
                return 0

            # 4. 执行操作
            saved = 0
            for action in valid_actions:
                saved += await self._execute_action(crud, action)

            if saved > 0:
                logger.info(f"记忆提取: 成功保存 {saved} 条记忆")
            return saved

        except Exception as e:
            logger.warning(f"记忆提取失败（非致命）: {e}")
            return 0

    async def _execute_action(self, crud: MemoryCRUD, action: MemoryExtractAction) -> int:
        """执行单条记忆操作，返回 1 表示成功，0 表示失败。"""
        try:
            if action.action == "delete":
                if action.memory_id is not None:
                    ok = await crud.delete_crud([action.memory_id])
                    if ok:
                        logger.info(f"记忆提取: 删除记忆 id={action.memory_id}, reason={action.reason}")
                        return 1
                return 0

            if action.action in ("create", "update"):
                key = (action.key or "").strip()
                value = (action.value or "").strip()
                if not key or not value:
                    logger.warning(f"记忆提取: 跳过空 key/value, action={action}")
                    return 0
                entry = await crud.upsert(
                    memory_type=action.memory_type or "fact",
                    key=key,
                    value=value,
                    category=action.category,
                    priority=action.priority,
                )
                return 1 if entry else 0

            logger.warning(f"记忆提取: 未知操作类型 action={action.action}")
            return 0
        except Exception as e:
            logger.warning(f"记忆提取: 执行 action 失败, action={action}, error={e}")
            return 0
