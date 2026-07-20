"""测试知识图谱功能

测试：
1. 实体添加和查询
2. 关系添加和查询
3. 图遍历
4. 持久化
"""

import shutil

import pytest

from app.plugin.module_ai.knowledge.knowledge_graph import KnowledgeGraph


class TestKnowledgeGraph:
    """测试知识图谱"""

    @pytest.fixture
    def temp_storage_dir(self, tmp_path):
        """临时存储目录"""
        storage_dir = tmp_path / "kg_test"
        storage_dir.mkdir()
        yield storage_dir
        # 清理
        if storage_dir.exists():
            shutil.rmtree(storage_dir)

    def test_add_entity(self, temp_storage_dir):
        """测试添加实体"""
        kg = KnowledgeGraph(knowledge_base_id=1, storage_dir=temp_storage_dir)

        # 添加实体
        assert kg.add_entity("张三", "person", {"role": "项目经理"})
        assert kg.add_entity("劳动法第123条", "law", {"article": "123"})

        # 查询实体
        entity = kg.get_entity("张三")
        assert entity is not None
        assert entity["type"] == "person"
        assert entity["role"] == "项目经理"

    def test_add_relation(self, temp_storage_dir):
        """测试添加关系"""
        kg = KnowledgeGraph(knowledge_base_id=1, storage_dir=temp_storage_dir)

        # 添加实体和关系
        kg.add_entity("合同5.2", "contract", {})
        kg.add_entity("劳动法第123条", "law", {})
        assert kg.add_relation("合同5.2", "劳动法第123条", "引用")

        # 查询邻居
        neighbors = kg.get_neighbors("合同5.2", relation_type="引用", direction="out")
        assert len(neighbors) > 0
        assert neighbors[0][0] == "劳动法第123条"

    def test_traverse(self, temp_storage_dir):
        """测试图遍历"""
        kg = KnowledgeGraph(knowledge_base_id=1, storage_dir=temp_storage_dir)

        # 构建小图: A -> B -> C
        kg.add_entity("A", "concept", {})
        kg.add_entity("B", "concept", {})
        kg.add_entity("C", "concept", {})
        kg.add_relation("A", "B", "关联")
        kg.add_relation("B", "C", "关联")

        # 从A遍历
        result = kg.traverse("A", max_hops=2)
        assert len(result["entities"]) >= 2  # 至少A和B
        assert len(result["relations"]) >= 1

    def test_find_path(self, temp_storage_dir):
        """测试路径查找"""
        kg = KnowledgeGraph(knowledge_base_id=1, storage_dir=temp_storage_dir)

        # 构建路径: A -> B -> C
        kg.add_entity("A", "concept", {})
        kg.add_entity("B", "concept", {})
        kg.add_entity("C", "concept", {})
        kg.add_relation("A", "B", "关联")
        kg.add_relation("B", "C", "关联")

        # 查找A到C的路径
        paths = kg.find_path("A", "C", max_length=5)
        assert len(paths) > 0
        assert paths[0][0] == "A"
        assert paths[0][-1] == "C"

    def test_persistence(self, temp_storage_dir):
        """测试持久化"""
        # 创建图并添加数据
        kg1 = KnowledgeGraph(knowledge_base_id=1, storage_dir=temp_storage_dir)
        kg1.add_entity("实体1", "person", {"age": 30})
        kg1.add_entity("实体2", "org", {})
        kg1.add_relation("实体1", "实体2", "工作于")
        assert kg1.save()

        # 创建新实例加载
        kg2 = KnowledgeGraph(knowledge_base_id=1, storage_dir=temp_storage_dir)
        entity = kg2.get_entity("实体1")
        assert entity is not None
        assert entity["type"] == "person"
        assert entity["age"] == 30

        neighbors = kg2.get_neighbors("实体1", relation_type="工作于", direction="out")
        assert len(neighbors) > 0

    def test_stats(self, temp_storage_dir):
        """测试统计信息"""
        kg = KnowledgeGraph(knowledge_base_id=1, storage_dir=temp_storage_dir)

        kg.add_entity("E1", "person", {})
        kg.add_entity("E2", "person", {})
        kg.add_entity("E3", "org", {})
        kg.add_relation("E1", "E3", "工作于")
        kg.add_relation("E2", "E3", "工作于")

        stats = kg.stats()
        assert stats["node_count"] == 3
        assert stats["edge_count"] == 2
        assert stats["entity_types"]["person"] == 2
        assert stats["entity_types"]["org"] == 1
        assert stats["relation_types"]["工作于"] == 2

    def test_clear(self, temp_storage_dir):
        """测试清空图"""
        kg = KnowledgeGraph(knowledge_base_id=1, storage_dir=temp_storage_dir)
        kg.add_entity("测试", "test", {})
        kg.save()

        assert kg.clear()
        assert kg.stats()["node_count"] == 0

    def test_entity_merge_accumulates_sources(self, temp_storage_dir):
        """同一实体多次添加时应合并属性并累积来源ID"""
        kg = KnowledgeGraph(knowledge_base_id=1, storage_dir=temp_storage_dir)

        kg.add_entity("张三", "person", {"source_chunk_id": "c1", "source_document_id": 100})
        kg.add_entity("张三", "person", {"source_chunk_id": "c2", "source_document_id": 100})
        kg.add_entity("张三", "person", {"source_chunk_id": "c3", "source_document_id": 200})

        entity = kg.get_entity("张三")
        assert set(entity["source_chunk_ids"]) == {"c1", "c2", "c3"}
        assert set(entity["source_document_ids"]) == {100, 200}
        # 仍是单一节点
        assert kg.stats()["node_count"] == 1

    def test_reverse_index_chunk_ids(self, temp_storage_dir):
        """反向索引应根据实体返回去重后的chunk_id"""
        kg = KnowledgeGraph(knowledge_base_id=1, storage_dir=temp_storage_dir)

        kg.add_entity("实体A", "concept", {"source_chunk_id": "c1"})
        kg.add_entity("实体A", "concept", {"source_chunk_id": "c2"})
        kg.add_entity("实体B", "concept", {"source_chunk_id": "c2"})
        kg.add_entity("实体B", "concept", {"source_chunk_id": "c3"})

        chunk_ids = kg.get_chunk_ids_for_entities(["实体A", "实体B", "不存在"])
        assert set(chunk_ids) == {"c1", "c2", "c3"}

    def test_remove_document_entities(self, temp_storage_dir):
        """删除文档时应移除独占实体、保留共享实体"""
        kg = KnowledgeGraph(knowledge_base_id=1, storage_dir=temp_storage_dir)

        # 仅属于文档100
        kg.add_entity("独占实体", "concept", {"source_document_id": 100})
        # 同时属于文档100和200
        kg.add_entity("共享实体", "concept", {"source_document_id": 100})
        kg.add_entity("共享实体", "concept", {"source_document_id": 200})

        removed = kg.remove_document_entities(100)
        assert removed == 1
        assert kg.get_entity("独占实体") is None

        shared = kg.get_entity("共享实体")
        assert shared is not None
        assert shared["source_document_ids"] == [200]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
