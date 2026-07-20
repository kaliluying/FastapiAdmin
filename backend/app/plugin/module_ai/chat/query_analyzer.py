"""查询分析器：自动识别查询类型并调整检索策略

根据查询特征动态调整向量/BM25权重，提升检索准确率。
"""

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class QueryAnalysis:
    """查询分析结果"""

    query_type: str  # exact | semantic | mixed
    suggested_alpha: float  # 建议的向量权重
    confidence: float  # 置信度 0-1
    features: dict  # 识别到的特征


class QueryAnalyzer:
    """查询类型分析器

    识别规则：
    1. 精确查询（exact）：包含编号、ID、引用标记
       - 示例："第123条"、"GDPR第17条"、"文档编号ABC123"
       - 策略：BM25权重高（alpha=0.3）

    2. 语义查询（semantic）：自然语言描述、概念性问题
       - 示例："如何处理合同违约"、"加班工资计算方法"
       - 策略：向量权重高（alpha=0.7）

    3. 混合查询（mixed）：既有关键词又有语义
       - 示例："劳动法关于加班的规定"
       - 策略：平衡权重（alpha=0.5）
    """

    # 精确查询特征正则
    EXACT_PATTERNS = [
        r"第\s*\d+\s*条",  # 第123条
        r"第\s*[一二三四五六七八九十百千万]+\s*条",  # 第一百二十三条
        r"[A-Z]{2,}\s*第?\s*\d+\s*条",  # GDPR第17条
        r"编号[:：]?\s*[A-Z0-9]+",  # 编号:ABC123
        r"[文档|合同|协议|政策]\s*[号编码]:?\s*\w+",  # 文档号ABC
        r"^\d+$",  # 纯数字
        r"[A-Z]{3,}\d+",  # ABC123
    ]

    # 语义查询特征关键词
    SEMANTIC_KEYWORDS = [
        "如何", "怎么", "怎样", "什么是", "为什么", "是否", "能否",
        "方法", "流程", "步骤", "原因", "区别", "比较",
        "解释", "说明", "介绍", "定义", "概念",
    ]

    # 引用标记（倾向精确查询）
    CITATION_PATTERNS = [
        r"《[^》]+》",  # 《劳动法》
        r"「[^」]+」",  # 「条款」
        r"【[^】]+】",  # 【法规】
    ]

    def analyze(self, query: str) -> QueryAnalysis:
        """分析查询类型

        Args:
            query: 用户查询文本

        Returns:
            QueryAnalysis对象
        """
        features = {}

        # 1. 检测精确查询特征
        exact_score = 0.0
        for pattern in self.EXACT_PATTERNS:
            if re.search(pattern, query):
                exact_score += 0.3
                features[f"exact_pattern_{pattern[:10]}"] = True

        # 检测引用标记
        for pattern in self.CITATION_PATTERNS:
            if re.search(pattern, query):
                exact_score += 0.2
                features["has_citation"] = True

        # 2. 检测语义查询特征
        semantic_score = 0.0
        for keyword in self.SEMANTIC_KEYWORDS:
            if keyword in query:
                semantic_score += 0.2
                features[f"semantic_keyword_{keyword}"] = True

        # 长句倾向语义查询
        if len(query) > 15:
            semantic_score += 0.1
            features["long_query"] = True

        # 3. 归一化得分
        total_score = exact_score + semantic_score
        if total_score > 0:
            exact_score = exact_score / total_score
            semantic_score = semantic_score / total_score

        # 4. 决策查询类型
        if exact_score > 0.6:
            query_type = "exact"
            suggested_alpha = 0.3  # BM25权重70%
            confidence = exact_score
        elif semantic_score > 0.6:
            query_type = "semantic"
            suggested_alpha = 0.7  # 向量权重70%
            confidence = semantic_score
        else:
            query_type = "mixed"
            suggested_alpha = 0.5  # 平衡
            confidence = 0.5

        return QueryAnalysis(
            query_type=query_type,
            suggested_alpha=suggested_alpha,
            confidence=confidence,
            features=features,
        )

    def adjust_alpha(self, base_alpha: float, query: str) -> float:
        """根据查询类型动态调整alpha

        Args:
            base_alpha: 基础alpha值（来自配置）
            query: 用户查询

        Returns:
            调整后的alpha值
        """
        analysis = self.analyze(query)

        # 高置信度时使用建议值，否则使用基础值
        if analysis.confidence > 0.7:
            return analysis.suggested_alpha
        else:
            # 低置信度时，向建议值微调
            return base_alpha * 0.7 + analysis.suggested_alpha * 0.3
