"""对话总结器 - 长对话自动总结

功能：
1. 检测对话轮数，每N轮触发总结
2. 保留关键信息，压缩历史对话
3. 维护对话连贯性
"""

from __future__ import annotations

import json
from typing import Any

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from app.config.setting import settings
from app.core.logger import logger


class ConversationSummary(BaseModel):
    """对话总结结果"""

    summary: str = Field(description="对话总结")
    key_points: list[str] = Field(default_factory=list, description="关键要点")
    entities_mentioned: list[str] = Field(default_factory=list, description="提到的实体")
    topics: list[str] = Field(default_factory=list, description="讨论的主题")
    unresolved_questions: list[str] = Field(default_factory=list, description="未解决的问题")


_SUMMARY_PROMPT = """你是对话总结专家。将长对话压缩为简洁的总结，保留关键信息。

## 总结要求
1. 提取对话的核心内容和结论
2. 列出关键要点（3-5个）
3. 记录提到的重要实体（人名、项目名、专有名词等）
4. 识别讨论的主题
5. 标记未解决的问题（如果有）

## 对话历史
{conversation}

## 输出格式（严格JSON）
```json
{{
  "summary": "简短总结（2-3句话）",
  "key_points": ["要点1", "要点2", "要点3"],
  "entities_mentioned": ["实体1", "实体2"],
  "topics": ["主题1", "主题2"],
  "unresolved_questions": ["未解决问题1"]
}}
```

请输出JSON："""


class ConversationSummarizer:
    """对话总结器"""

    def __init__(
        self,
        summary_interval: int = 10,
        max_history_length: int = 8000,
    ) -> None:
        """初始化

        Args:
            summary_interval: 每N轮对话触发总结
            max_history_length: 对话历史最大字符数
        """
        self.summary_interval = summary_interval
        self.max_history_length = max_history_length
        self._llm: ChatOpenAI | None = None

    @property
    def llm(self) -> ChatOpenAI:
        if self._llm is None:
            self._llm = ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL,
                model=settings.OPENAI_MODEL,
                temperature=0.3,
            )
        return self._llm

    def should_summarize(self, conversation_turns: int) -> bool:
        """判断是否应该触发总结

        Args:
            conversation_turns: 当前对话轮数

        Returns:
            是否应该总结
        """
        return conversation_turns > 0 and conversation_turns % self.summary_interval == 0

    async def summarize(
        self,
        conversation_history: list[dict[str, Any]],
    ) -> ConversationSummary:
        """总结对话历史

        Args:
            conversation_history: 对话历史列表，每项包含role和content

        Returns:
            对话总结结果
        """
        if not conversation_history:
            return ConversationSummary(summary="空对话")

        try:
            # 构建对话文本
            conversation_text = self._format_conversation(conversation_history)

            # 截断过长对话
            if len(conversation_text) > self.max_history_length:
                conversation_text = conversation_text[-self.max_history_length :]
                logger.info(f"对话历史过长，截断到{self.max_history_length}字符")

            prompt = _SUMMARY_PROMPT.format(conversation=conversation_text)
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])

            raw_text = response.content
            if isinstance(raw_text, list):
                raw_text = "".join(str(part) for part in raw_text)

            if not isinstance(raw_text, str) or not raw_text.strip():
                logger.warning("对话总结: LLM返回空内容")
                return ConversationSummary(summary="总结失败")

            result = self._parse_result(raw_text)
            logger.info(f"对话总结成功: {len(result.key_points)}个要点")
            return result

        except Exception as e:
            logger.warning(f"对话总结失败: {e}")
            return ConversationSummary(summary=f"总结失败: {str(e)}")

    def _format_conversation(self, history: list[dict[str, Any]]) -> str:
        """格式化对话历史为文本"""
        lines = []
        for i, turn in enumerate(history, 1):
            role = turn.get("role", "unknown")
            content = turn.get("content", "")
            if role == "user":
                lines.append(f"[轮{i}] 用户: {content}")
            elif role == "assistant":
                lines.append(f"[轮{i}] 助手: {content}")
        return "\n".join(lines)

    def _parse_result(self, raw: str) -> ConversationSummary:
        """解析LLM返回的JSON"""
        text = raw.strip()

        # 去掉markdown代码块
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        try:
            data = json.loads(text)
            return ConversationSummary(**data)
        except json.JSONDecodeError:
            # 尝试提取第一个{到最后一个}
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end > start:
                try:
                    data = json.loads(text[start : end + 1])
                    return ConversationSummary(**data)
                except (json.JSONDecodeError, Exception):
                    pass

        logger.warning(f"无法解析对话总结结果: {raw[:200]}")
        return ConversationSummary(summary=raw[:500] if raw else "解析失败")
