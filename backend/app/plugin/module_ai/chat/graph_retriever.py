"""图+向量混合检索器

功能：
1. 向量检索找到初始相关实体
2. 图遍历扩展关联知识
3. 融合结果生成上下文
4. 支持结构化推理
"""

from __future__ import annotations

from typing import Any

from app.core.logger import logger
from app.plugin.module_ai.chat.rag import RagDocument
from app.plugin.module_ai.knowledge.chroma_store import ChromaKnowledgeStore
from app.plugin.module_ai.knowledge.embedding import EmbeddingClient, create_embedding_client
from app.plugin.module_ai.knowledge.knowledge_graph import KnowledgeGraph


class GraphEnhancedRetriever:
    """图增强检索器"""

    def __init__(
        self,
        knowledge_base_id: int,
        chroma_store: ChromaKnowledgeStore | None = None,
        embedding_client: EmbeddingClient | None = None,
        kg: KnowledgeGraph | None = None,
        vector_top_k: int = 5,
        graph_max_hops: int = 2,
        enable_graph_expansion: bool = True,
    ) -> None:
        """初始化

        Args:
            knowledge_base_id: 知识库ID
            chroma_store: 向量存储
            embedding_client: 向量化客户端
            kg: 知识图谱实例
            vector_top_k: 向量检索top-k
            graph_max_hops: 图遍历最大跳数
            enable_graph_expansion: 是否启用图扩展
        """
        self.knowledge_base_id = knowledge_base_id
        self.chroma_store = chroma_store
        self.embedding_client = embedding_client
        self.kg = kg or KnowledgeGraph(knowledge_base_id=knowledge_base_id)
        self.vector_top_k = vector_top_k
        self.graph_max_hops = graph_max_hops
        self.enable_graph_expansion = enable_graph_expansion

    def _get_chroma_store(self) -> ChromaKnowledgeStore:
        """延迟初始化ChromaStore"""
        if self.chroma_store is None:
            self.chroma_store = ChromaKnowledgeStore()
        return self.chroma_store

    def _get_embedding_client(self) -> EmbeddingClient:
        """延迟初始化EmbeddingClient"""
        if self.embedding_client is None:
            self.embedding_client = create_embedding_client()
        return self.embedding_client

    async def retrieve(
        self,
        query: str,
        knowledge_base_ids: list[int] | None = None,
    ) -> list[RagDocument]:
        """图增强检索

        流程：
        1. 向量检索找到相关chunks
        2. 从chunks中提取实体
        3. 图遍历扩展关联实体
        4. 收集所有相关chunks
        5. 去重并排序

        Args:
            query: 用户查询
            knowledge_base_ids: 知识库ID列表

        Returns:
            检索结果
        """
        if knowledge_base_ids is None:
            knowledge_base_ids = [self.knowledge_base_id]

        try:
            # 1. 向量检索
            embeddings = await self._get_embedding_client().embed_texts([query])
            vector_results = await self._get_chroma_store().query(
                query_embedding=embeddings[0],
                knowledge_base_ids=knowledge_base_ids,
                top_k=self.vector_top_k,
            )

            initial_chunks = self._parse_vector_results(vector_results)
            logger.debug(f"向量检索: {len(initial_chunks)}个chunks")

            # 如果未启用图扩展，直接返回向量结果
            if not self.enable_graph_expansion:
                return self._chunks_to_documents(initial_chunks)

            # 2. 提取实体并图遍历
            expanded_chunks = await self._expand_with_graph(query, initial_chunks)
            logger.debug(f"图扩展后: {len(expanded_chunks)}个chunks")

            # 3. 去重并构建文档
            return self._chunks_to_documents(expanded_chunks)

        except Exception as e:
            logger.warning(f"图增强检索失败: {e}")
            return []

    async def _expand_with_graph(
        self,
        query: str,
        initial_chunks: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """使用图扩展检索结果

        Args:
            query: 查询
            initial_chunks: 初始检索到的chunks

        Returns:
            扩展后的chunks
        """
        # 从初始chunks中提取实体名称
        entity_names = self._extract_entity_names_from_chunks(initial_chunks)
        if not entity_names:
            logger.debug("未找到可识别的实体，跳过图扩展")
            return initial_chunks

        # 从query中也提取实体
        query_entities = self._extract_entities_from_query(query)
        all_entities = list(set(entity_names + query_entities))
        logger.debug(f"识别到{len(all_entities)}个实体用于图遍历")

        # 图遍历获取关联实体
        expanded_entity_names = set()
        graph_relations = []

        for entity in all_entities:
            if entity not in self.kg.graph:
                continue

            traversal_result = self.kg.traverse(
                start_entity=entity,
                max_hops=self.graph_max_hops,
            )

            for e in traversal_result["entities"]:
                expanded_entity_names.add(e["name"])

            graph_relations.extend(traversal_result["relations"])

        logger.debug(f"图遍历扩展到{len(expanded_entity_names)}个实体, {len(graph_relations)}个关系")

        # 根据扩展的实体，找到相关的chunks
        # TODO: 这里需要一个反向索引：entity_name -> chunk_ids
        # 目前简化处理：返回初始chunks + 图结构信息

        # 将图关系作为额外的context
        if graph_relations:
            graph_context = self._format_graph_relations(graph_relations)
            # 添加图结构作为虚拟chunk
            initial_chunks.append({
                "id": "graph_context",
                "content": graph_context,
                "metadata": {"type": "graph_structure"},
            })

        return initial_chunks

    def _extract_entity_names_from_chunks(self, chunks: list[dict[str, Any]]) -> list[str]:
        """从chunks中提取实体名称（简化版）

        实际应该：
        1. 查询chunk的metadata中的entities
        2. 或者重新对chunk内容做NER

        当前简化：查找图中已存在的实体
        """
        entities = []
        for chunk in chunks:
            content = chunk.get("content", "")
            # 简单匹配：查找内容中是否包含图中的实体
            for node in self.kg.graph.nodes():
                if node in content:
                    entities.append(node)
        return list(set(entities))

    def _extract_entities_from_query(self, query: str) -> list[str]:
        """从查询中提取实体（简化版）"""
        entities = []
        for node in self.kg.graph.nodes():
            if node in query:
                entities.append(node)
        return entities

    def _format_graph_relations(self, relations: list[dict[str, Any]]) -> str:
        """格式化图关系为文本"""
        lines = ["## 相关知识图谱结构\n"]
        for rel in relations:
            source = rel.get("source", "")
            target = rel.get("target", "")
            rel_type = rel.get("type", "关联")
            lines.append(f"- {source} {rel_type} {target}")
        return "\n".join(lines)

    def _parse_vector_results(self, results: dict[str, Any]) -> list[dict[str, Any]]:
        """解析向量检索结果"""
        chunks = []
        ids = results.get("ids", [[]])[0]
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]

        for i, chunk_id in enumerate(ids):
            chunks.append({
                "id": chunk_id,
                "content": documents[i] if i < len(documents) else "",
                "metadata": metadatas[i] if i < len(metadatas) else {},
            })

        return chunks

    def _chunks_to_documents(self, chunks: list[dict[str, Any]]) -> list[RagDocument]:
        """将chunks转换为RagDocument"""
        documents = []
        seen = set()

        for chunk in chunks:
            chunk_id = chunk.get("id")
            if chunk_id in seen:
                continue
            seen.add(chunk_id)

            documents.append(
                RagDocument(
                    content=chunk.get("content", ""),
                    metadata=chunk.get("metadata", {}),
                )
            )

        return documents
