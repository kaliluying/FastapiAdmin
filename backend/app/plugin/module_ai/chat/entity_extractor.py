"""实体关系提取器 - 从对话和文档中提取结构化知识

功能：
1. 提取实体（人物、组织、概念、法条、日期等）
2. 提取实体间关系（引用、包含、依赖等）
3. 为知识图谱构建准备数据
"""

from __future__ import annotations

import json
from typing import Any

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from app.config.setting import settings
from app.core.logger import logger


class Entity(BaseModel):
    """实体"""

    name: str = Field(description="实体名称")
    type: str = Field(description="实体类型：person/org/concept/law/date/location/other")
    properties: dict[str, Any] = Field(default_factory=dict, description="实体属性")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="置信度")


class Relation(BaseModel):
    """实体关系"""

    source: str = Field(description="源实体名称")
    target: str = Field(description="目标实体名称")
    relation_type: str = Field(description="关系类型：引用/包含/依赖/导致/属于/解释等")
    properties: dict[str, Any] = Field(default_factory=dict, description="关系属性")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="置信度")


class EntityRelationResult(BaseModel):
    """实体关系提取结果"""

    entities: list[Entity] = Field(default_factory=list)
    relations: list[Relation] = Field(default_factory=list)
    summary: str = Field(default="", description="简短总结")


# 提取prompt
_ENTITY_RELATION_PROMPT = """你是实体关系提取专家。从对话或文档中提取结构化知识。

## 实体类型
- person: 人物（张三、李经理）
- org: 组织（某公司、财务部）
- concept: 概念（RAG检索、混合模式）
- law: 法律条款（劳动法第123条、GDPR第17条）
- date: 日期时间（2026年1月、每周一）
- location: 地点（北京、会议室A）
- other: 其他

## 关系类型
- 引用: A引用B（文档引用法条）
- 包含: A包含B（章节包含段落）
- 依赖: A依赖B（功能依赖模块）
- 导致: A导致B（原因导致结果）
- 属于: A属于B（员工属于部门）
- 解释: A解释B（定义解释概念）
- 关联: A关联B（相关但不确定具体关系）

## 提取规则
1. 只提取明确出现的实体，不要推测
2. 关系必须在文本中有明确依据
3. 专有名词、编号、具体日期优先提取
4. 给出0-1的置信度评分
5. 输出严格JSON格式

## 输出格式示例
```json
{
  "entities": [
    {
      "name": "劳动法第123条",
      "type": "law",
      "properties": {"article_number": "123", "law_name": "劳动法"},
      "confidence": 0.95
    },
    {
      "name": "张三",
      "type": "person",
      "properties": {"role": "项目经理"},
      "confidence": 0.9
    }
  ],
  "relations": [
    {
      "source": "合同条款5.2",
      "target": "劳动法第123条",
      "relation_type": "引用",
      "properties": {},
      "confidence": 0.85
    }
  ],
  "summary": "提取了2个实体和1个关系"
}
```

## 待分析文本
{text}

请输出JSON："""


class EntityRelationExtractor:
    """实体关系提取器"""

    def __init__(self, confidence_threshold: float = 0.6) -> None:
        self.confidence_threshold = confidence_threshold
        self._llm: ChatOpenAI | None = None

    @property
    def llm(self) -> ChatOpenAI:
        if self._llm is None:
            self._llm = ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL,
                model=settings.OPENAI_MODEL,
                temperature=0.2,  # 低温度确保一致性
            )
        return self._llm

    async def extract(self, text: str, max_length: int = 4000) -> EntityRelationResult:
        """从文本中提取实体和关系

        Args:
            text: 待分析文本
            max_length: 文本最大长度（超过会截断）

        Returns:
            实体关系提取结果
        """
        if not text or not text.strip():
            return EntityRelationResult()

        # 截断过长文本
        text = text[:max_length]

        try:
            prompt = _ENTITY_RELATION_PROMPT.format(text=text)
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])

            raw_text = response.content
            if isinstance(raw_text, list):
                raw_text = "".join(str(part) for part in raw_text)

            if not isinstance(raw_text, str) or not raw_text.strip():
                logger.warning("实体关系提取: LLM返回空内容")
                return EntityRelationResult()

            result = self._parse_result(raw_text)

            # 过滤低置信度
            result.entities = [e for e in result.entities if e.confidence >= self.confidence_threshold]
            result.relations = [r for r in result.relations if r.confidence >= self.confidence_threshold]

            logger.info(f"实体关系提取: {len(result.entities)}个实体, {len(result.relations)}个关系")
            return result

        except Exception as e:
            logger.warning(f"实体关系提取失败: {e}")
            return EntityRelationResult()

    def _parse_result(self, raw: str) -> EntityRelationResult:
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
            return EntityRelationResult(**data)
        except json.JSONDecodeError:
            # 尝试提取第一个{到最后一个}
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end > start:
                try:
                    data = json.loads(text[start : end + 1])
                    return EntityRelationResult(**data)
                except Exception:
                    pass

        logger.warning(f"无法解析实体关系提取结果: {raw[:200]}")
        return EntityRelationResult()
