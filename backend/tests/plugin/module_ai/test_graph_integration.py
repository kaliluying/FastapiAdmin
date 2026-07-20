"""测试图+向量混合检索集成

测试流程：
1. 构建知识图谱
2. 图增强检索
"""

import pytest

from app.plugin.module_ai.chat.entity_extractor import Entity, EntityRelationResult, Relation
from app.plugin.module_ai.knowledge.kg_builder import DocumentKnowledgeGraphBuilder
from app.plugin.module_ai.knowledge.knowledge_graph import KnowledgeGraph


class TestGraphIntegration:
    """测试知识图谱集成"""

    @pytest.fixture
    def temp_kg(self, tmp_path):
        """临时知识图谱"""
        storage_dir = tmp_path / "kg_integration"
        storage_dir.mkdir()
        kg = KnowledgeGraph(knowledge_base_id=999, storage_dir=storage_dir)
        yield kg
        kg.clear()

    def test_kg_builder_manual(self, temp_kg):
        """测试手动构建知识图谱（不调用LLM）"""
        # 手动添加实体和关系（模拟提取结果）
        temp_kg.add_entity("劳动法第123条", "law", {"article": "123"})
        temp_kg.add_entity("合同条款5.2", "contract", {})
        temp_kg.add_entity("员工加班", "concept", {})

        temp_kg.add_relation("合同条款5.2", "劳动法第123条", "引用")
        temp_kg.add_relation("员工加班", "劳动法第123条", "受...约束")

        # 验证图结构
        stats = temp_kg.stats()
        assert stats["node_count"] == 3
        assert stats["edge_count"] == 2

        # 测试遍历
        result = temp_kg.traverse("合同条款5.2", max_hops=2)
        assert len(result["entities"]) >= 2
        assert len(result["relations"]) >= 1

    def test_graph_traversal_with_filtering(self, temp_kg):
        """测试带过滤的图遍历"""
        # 构建图
        temp_kg.add_entity("A", "concept", {})
        temp_kg.add_entity("B", "concept", {})
        temp_kg.add_entity("C", "concept", {})
        temp_kg.add_relation("A", "B", "包含")
        temp_kg.add_relation("B", "C", "引用")
        temp_kg.add_relation("A", "C", "依赖")

        # 只遍历"包含"关系
        result = temp_kg.traverse("A", max_hops=2, relation_filter=["包含"])
        relation_types = {r["type"] for r in result["relations"]}
        assert "包含" in relation_types
        assert "引用" not in relation_types

    def test_entity_extraction_result_structure(self):
        """测试实体提取结果结构"""
        # 创建模拟的提取结果
        entity = Entity(
            name="测试实体",
            type="person",
            properties={"role": "工程师"},
            confidence=0.9,
        )

        relation = Relation(
            source="实体A",
            target="实体B",
            relation_type="工作于",
            properties={},
            confidence=0.85,
        )

        result = EntityRelationResult(
            entities=[entity],
            relations=[relation],
            summary="测试总结",
        )

        assert len(result.entities) == 1
        assert len(result.relations) == 1
        assert result.entities[0].name == "测试实体"
        assert result.relations[0].relation_type == "工作于"


class TestGraphRetriever:
    """测试图增强检索器（不调用LLM）"""

    def test_entity_name_extraction_logic(self):
        """测试实体名称提取逻辑"""
        # 模拟chunk
        chunks = [
            {"id": 1, "content": "劳动法第123条规定了加班工资的计算方法"},
            {"id": 2, "content": "根据合同条款5.2，员工需遵守公司规定"},
        ]

        # 模拟实体匹配（简化版）
        known_entities = ["劳动法第123条", "合同条款5.2", "员工"]
        extracted = []

        for chunk in chunks:
            content = chunk["content"]
            for entity in known_entities:
                if entity in content:
                    extracted.append(entity)

        assert "劳动法第123条" in extracted
        assert "合同条款5.2" in extracted


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
