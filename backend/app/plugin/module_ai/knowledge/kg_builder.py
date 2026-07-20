"""文档知识图谱构建服务

功能：
1. 从文档chunk自动提取实体和关系
2. 构建知识图谱
3. 增量更新
"""

from __future__ import annotations

from typing import Any

from app.core.logger import logger
from app.plugin.module_ai.chat.entity_extractor import EntityRelationExtractor
from app.plugin.module_ai.knowledge.knowledge_graph import KnowledgeGraph


class DocumentKnowledgeGraphBuilder:
    """文档知识图谱构建器"""

    def __init__(
        self,
        knowledge_base_id: int,
        confidence_threshold: float = 0.7,
    ) -> None:
        """初始化

        Args:
            knowledge_base_id: 知识库ID
            confidence_threshold: 置信度阈值
        """
        self.knowledge_base_id = knowledge_base_id
        self.extractor = EntityRelationExtractor(confidence_threshold=confidence_threshold)
        self.graph = KnowledgeGraph(knowledge_base_id=knowledge_base_id)

    async def build_from_chunks(
        self,
        chunks: list[dict[str, Any]],
        batch_size: int = 10,
    ) -> dict[str, Any]:
        """从文档chunks构建知识图谱

        Args:
            chunks: 文档块列表
            batch_size: 批处理大小

        Returns:
            构建统计信息
        """
        total_chunks = len(chunks)
        total_entities = 0
        total_relations = 0
        processed = 0

        logger.info(f"开始构建知识图谱: {total_chunks}个chunks")

        try:
            for i in range(0, total_chunks, batch_size):
                batch = chunks[i : i + batch_size]

                for chunk in batch:
                    content = chunk.get("content", "")
                    if not content:
                        continue

                    # 提取实体和关系
                    result = await self.extractor.extract(content, max_length=2000)

                    # 添加到图
                    for entity in result.entities:
                        self.graph.add_entity(
                            entity_name=entity.name,
                            entity_type=entity.type,
                            properties={
                                **entity.properties,
                                "confidence": entity.confidence,
                                "source_chunk_id": chunk.get("id"),
                                "source_document_id": chunk.get("document_id"),
                            },
                        )
                        total_entities += 1

                    for relation in result.relations:
                        self.graph.add_relation(
                            source=relation.source,
                            target=relation.target,
                            relation_type=relation.relation_type,
                            properties={
                                **relation.properties,
                                "confidence": relation.confidence,
                                "source_chunk_id": chunk.get("id"),
                            },
                        )
                        total_relations += 1

                    processed += 1

                logger.info(f"已处理 {processed}/{total_chunks} chunks")

            # 全部处理完成后统一保存一次，避免每批次全量重写JSON
            self.graph.save()

            stats = self.graph.stats()
            logger.info(
                f"知识图谱构建完成: {stats['node_count']}个节点, "
                f"{stats['edge_count']}条边, "
                f"提取了{total_entities}个实体, {total_relations}个关系"
            )

            return {
                "success": True,
                "total_chunks": total_chunks,
                "processed_chunks": processed,
                "entities_extracted": total_entities,
                "relations_extracted": total_relations,
                "graph_stats": stats,
            }

        except Exception as e:
            logger.error(f"知识图谱构建失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "processed_chunks": processed,
            }

    async def update_from_document(
        self,
        document_id: int,
        chunks: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """从单个文档更新知识图谱

        Args:
            document_id: 文档ID
            chunks: 文档的chunks

        Returns:
            更新结果
        """
        logger.info(f"更新文档{document_id}的知识图谱")

        # 删除该文档的旧实体（通过source_document_id识别），
        # 仅来源于该文档的实体整体删除，多来源实体仅剥离该文档来源
        removed = self.graph.remove_document_entities(document_id)
        logger.info(f"文档{document_id}旧实体清理完成: 删除{removed}个")

        # 确保新chunks携带document_id，供后续增量删除识别
        for chunk in chunks:
            chunk.setdefault("document_id", document_id)

        # 重新构建
        return await self.build_from_chunks(chunks)

    def get_graph(self) -> KnowledgeGraph:
        """获取知识图谱实例

        Returns:
            KnowledgeGraph实例
        """
        return self.graph
