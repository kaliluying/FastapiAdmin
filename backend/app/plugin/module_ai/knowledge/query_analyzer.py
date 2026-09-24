"""Query policy used to balance semantic and exact-match retrieval."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any


@dataclass
class QueryAnalysis:
    query_type: str
    suggested_alpha: float
    confidence: float
    features: dict[str, Any]


class QueryAnalyzer:
    """Classify a query and suggest a vector/BM25 weight."""

    EXACT_PATTERNS = [
        r"第\s*\d+\s*条",
        r"第\s*[一二三四五六七八九十百千万]+\s*条",
        r"[A-Z]{2,}\s*第?\s*\d+\s*条",
        r"编号[:：]?\s*[A-Z0-9]+",
        r"[文档|合同|协议|政策]\s*[号编码]:?\s*\w+",
        r"^\d+$",
        r"[A-Z]{3,}\d+",
    ]
    SEMANTIC_KEYWORDS = [
        "如何", "怎么", "怎样", "什么是", "为什么", "是否", "能否",
        "方法", "流程", "步骤", "原因", "区别", "比较", "解释", "说明", "介绍", "定义", "概念",
    ]
    CITATION_PATTERNS = [r"《[^》]+》", r"「[^」]+」", r"【[^】]+】"]

    def analyze(self, query: str) -> QueryAnalysis:
        features: dict[str, Any] = {}
        exact_score = 0.0
        for pattern in self.EXACT_PATTERNS:
            if re.search(pattern, query):
                exact_score += 0.3
                features[f"exact_pattern_{pattern[:10]}"] = True

        for pattern in self.CITATION_PATTERNS:
            if re.search(pattern, query):
                exact_score += 0.2
                features["has_citation"] = True

        semantic_score = 0.0
        for keyword in self.SEMANTIC_KEYWORDS:
            if keyword in query:
                semantic_score += 0.2
                features[f"semantic_keyword_{keyword}"] = True

        if len(query) > 15:
            semantic_score += 0.1
            features["long_query"] = True

        total_score = exact_score + semantic_score
        if total_score > 0:
            exact_score /= total_score
            semantic_score /= total_score

        if exact_score > 0.6:
            query_type, suggested_alpha, confidence = "exact", 0.3, exact_score
        elif semantic_score > 0.6:
            query_type, suggested_alpha, confidence = "semantic", 0.7, semantic_score
        else:
            query_type, suggested_alpha, confidence = "mixed", 0.5, 0.5

        return QueryAnalysis(query_type, suggested_alpha, confidence, features)

    def adjust_alpha(self, base_alpha: float, query: str) -> float:
        analysis = self.analyze(query)
        if analysis.confidence > 0.7:
            return analysis.suggested_alpha
        return base_alpha * 0.7 + analysis.suggested_alpha * 0.3
