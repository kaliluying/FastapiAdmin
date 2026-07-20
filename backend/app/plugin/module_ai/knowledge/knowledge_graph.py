"""知识图谱存储 - 基于networkx的轻量级实现

功能：
1. 图结构存储（实体+关系）
2. 图遍历和查询
3. JSON持久化
4. 支持知识库隔离
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import networkx as nx

from app.config.setting import settings
from app.core.logger import logger


class KnowledgeGraph:
    """知识图谱存储"""

    def __init__(self, knowledge_base_id: int, storage_dir: Path | None = None) -> None:
        """初始化

        Args:
            knowledge_base_id: 知识库ID
            storage_dir: 存储目录，默认使用配置
        """
        self.knowledge_base_id = knowledge_base_id
        self.storage_dir = storage_dir or Path(settings.BASE_DIR) / "data" / "knowledge_graphs"
        self.storage_dir.mkdir(parents=True, exist_ok=True)

        self.graph = nx.MultiDiGraph()  # 有向多重图（支持同一对节点间多条边）
        self._graph_file = self.storage_dir / f"kg_{knowledge_base_id}.json"

        # 加载已有图
        self._load()

    def add_entity(
        self,
        entity_name: str,
        entity_type: str,
        properties: dict[str, Any] | None = None,
    ) -> bool:
        """添加实体节点

        Args:
            entity_name: 实体名称（唯一标识）
            entity_type: 实体类型
            properties: 实体属性

        Returns:
            是否成功
        """
        try:
            if properties is None:
                properties = {}

            self.graph.add_node(
                entity_name,
                type=entity_type,
                **properties,
            )
            logger.debug(f"添加实体: {entity_name} ({entity_type})")
            return True
        except Exception as e:
            logger.warning(f"添加实体失败: {e}")
            return False

    def add_relation(
        self,
        source: str,
        target: str,
        relation_type: str,
        properties: dict[str, Any] | None = None,
    ) -> bool:
        """添加关系边

        Args:
            source: 源实体名称
            target: 目标实体名称
            relation_type: 关系类型
            properties: 关系属性

        Returns:
            是否成功
        """
        try:
            if properties is None:
                properties = {}

            # 确保节点存在
            if source not in self.graph:
                self.add_entity(source, "unknown", {})
            if target not in self.graph:
                self.add_entity(target, "unknown", {})

            self.graph.add_edge(
                source,
                target,
                relation_type=relation_type,
                **properties,
            )
            logger.debug(f"添加关系: {source} -[{relation_type}]-> {target}")
            return True
        except Exception as e:
            logger.warning(f"添加关系失败: {e}")
            return False

    def get_entity(self, entity_name: str) -> dict[str, Any] | None:
        """获取实体信息

        Args:
            entity_name: 实体名称

        Returns:
            实体属性字典，不存在返回None
        """
        if entity_name not in self.graph:
            return None
        return dict(self.graph.nodes[entity_name])

    def get_neighbors(
        self,
        entity_name: str,
        relation_type: str | None = None,
        direction: str = "out",
    ) -> list[tuple[str, dict[str, Any]]]:
        """获取邻居节点

        Args:
            entity_name: 实体名称
            relation_type: 关系类型过滤（None表示所有类型）
            direction: 方向（out=出边，in=入边，both=双向）

        Returns:
            邻居节点列表 [(节点名, 边属性), ...]
        """
        if entity_name not in self.graph:
            return []

        neighbors = []

        try:
            if direction in ("out", "both"):
                for target in self.graph.successors(entity_name):
                    edges = self.graph.get_edge_data(entity_name, target)
                    for edge_data in edges.values():
                        if relation_type is None or edge_data.get("relation_type") == relation_type:
                            neighbors.append((target, edge_data))

            if direction in ("in", "both"):
                for source in self.graph.predecessors(entity_name):
                    edges = self.graph.get_edge_data(source, entity_name)
                    for edge_data in edges.values():
                        if relation_type is None or edge_data.get("relation_type") == relation_type:
                            neighbors.append((source, edge_data))

        except Exception as e:
            logger.warning(f"获取邻居节点失败: {e}")

        return neighbors

    def traverse(
        self,
        start_entity: str,
        max_hops: int = 2,
        relation_filter: list[str] | None = None,
        max_results: int = 100,
    ) -> dict[str, Any]:
        """图遍历，获取关联实体

        Args:
            start_entity: 起始实体
            max_hops: 最大跳数
            relation_filter: 关系类型过滤
            max_results: 最大结果数量（防止大图遍历性能问题）

        Returns:
            遍历结果 {
                "entities": [实体列表],
                "relations": [关系列表],
                "paths": [路径列表]
            }
        """
        if start_entity not in self.graph:
            return {"entities": [], "relations": [], "paths": []}

        visited_entities = set()
        visited_relations = []
        paths = []

        def dfs(entity: str, depth: int, path: list[str]):
            # 添加结果数量限制，防止大图遍历性能问题
            if len(visited_entities) >= max_results:
                return
            if depth > max_hops or entity in visited_entities:
                return

            visited_entities.add(entity)
            current_path = path + [entity]

            neighbors = self.get_neighbors(entity, direction="both")
            for neighbor, edge_data in neighbors:
                rel_type = edge_data.get("relation_type")

                # 关系类型过滤
                if relation_filter and rel_type not in relation_filter:
                    continue

                visited_relations.append({
                    "source": entity,
                    "target": neighbor,
                    "type": rel_type,
                    "properties": {k: v for k, v in edge_data.items() if k != "relation_type"},
                })

                if depth < max_hops:
                    dfs(neighbor, depth + 1, current_path)

            if len(current_path) > 1:
                paths.append(current_path)

        dfs(start_entity, 0, [])

        entities = []
        for entity_name in visited_entities:
            entity_data = self.get_entity(entity_name)
            if entity_data:
                entities.append({
                    "name": entity_name,
                    "type": entity_data.get("type", "unknown"),
                    "properties": {k: v for k, v in entity_data.items() if k != "type"},
                })

        return {
            "entities": entities,
            "relations": visited_relations,
            "paths": paths,
        }

    def find_path(self, source: str, target: str, max_length: int = 5) -> list[list[str]]:
        """查找两实体间的路径

        Args:
            source: 源实体
            target: 目标实体
            max_length: 最大路径长度

        Returns:
            路径列表
        """
        if source not in self.graph or target not in self.graph:
            return []

        try:
            # 找出所有简单路径
            paths = list(nx.all_simple_paths(
                self.graph,
                source=source,
                target=target,
                cutoff=max_length,
            ))
            return paths
        except Exception as e:
            logger.warning(f"查找路径失败: {e}")
            return []

    def save(self) -> bool:
        """保存图到文件（原子写入）

        Returns:
            是否成功
        """
        try:
            import os
            import tempfile

            # 转换为JSON可序列化格式
            data = {
                "knowledge_base_id": self.knowledge_base_id,
                "nodes": [
                    {"id": node, **self.graph.nodes[node]}
                    for node in self.graph.nodes()
                ],
                "edges": [
                    {
                        "source": u,
                        "target": v,
                        "key": k,
                        **edge_data,
                    }
                    for u, v, k, edge_data in self.graph.edges(keys=True, data=True)
                ],
            }

            # 使用临时文件+原子重命名，避免并发写入问题
            temp_fd, temp_path = tempfile.mkstemp(
                suffix=".json",
                dir=self.storage_dir,
                text=True,
            )

            try:
                with os.fdopen(temp_fd, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                # 原子性重命名（Windows和Unix都支持）
                os.replace(temp_path, self._graph_file)

                logger.info(f"知识图谱已保存: {len(self.graph.nodes)}个节点, {len(self.graph.edges)}条边")
                return True

            except Exception:
                # 清理临时文件
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                raise

        except Exception as e:
            logger.error(f"保存知识图谱失败: {e}")
            return False

    def _load(self) -> bool:
        """从文件加载图

        Returns:
            是否成功
        """
        if not self._graph_file.exists():
            logger.info(f"知识图谱文件不存在，创建新图: {self._graph_file}")
            return False

        try:
            with open(self._graph_file, encoding="utf-8") as f:
                data = json.load(f)

            # 加载节点
            for node_data in data.get("nodes", []):
                node_id = node_data.pop("id")
                self.graph.add_node(node_id, **node_data)

            # 加载边
            for edge_data in data.get("edges", []):
                source = edge_data.pop("source")
                target = edge_data.pop("target")
                key = edge_data.pop("key", None)
                self.graph.add_edge(source, target, key=key, **edge_data)

            logger.info(f"知识图谱已加载: {len(self.graph.nodes)}个节点, {len(self.graph.edges)}条边")
            return True
        except Exception as e:
            logger.error(f"加载知识图谱失败: {e}")
            return False

    def clear(self) -> bool:
        """清空图

        Returns:
            是否成功
        """
        try:
            self.graph.clear()
            if self._graph_file.exists():
                self._graph_file.unlink()
            logger.info("知识图谱已清空")
            return True
        except Exception as e:
            logger.error(f"清空知识图谱失败: {e}")
            return False

    def stats(self) -> dict[str, Any]:
        """获取图统计信息

        Returns:
            统计信息字典
        """
        return {
            "node_count": len(self.graph.nodes),
            "edge_count": len(self.graph.edges),
            "entity_types": self._count_entity_types(),
            "relation_types": self._count_relation_types(),
        }

    def _count_entity_types(self) -> dict[str, int]:
        """统计实体类型分布"""
        types: dict[str, int] = {}
        for node in self.graph.nodes():
            entity_type = self.graph.nodes[node].get("type", "unknown")
            types[entity_type] = types.get(entity_type, 0) + 1
        return types

    def _count_relation_types(self) -> dict[str, int]:
        """统计关系类型分布"""
        types: dict[str, int] = {}
        for _, _, edge_data in self.graph.edges(data=True):
            rel_type = edge_data.get("relation_type", "unknown")
            types[rel_type] = types.get(rel_type, 0) + 1
        return types
