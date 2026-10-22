"""查询分析的兼容导入入口；实现现归知识库模块所有。"""

from app.plugin.module_ai.knowledge.public import QueryAnalysis, QueryAnalyzer

__all__ = ["QueryAnalysis", "QueryAnalyzer"]
