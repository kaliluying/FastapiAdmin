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
        # 图节点集合缓存（按节点数版本失效）
        self._node_set_version: int | None = None
        self._node_set_cache: set[str] = set()
        self._long_nodes_cache: list[str] = []

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
        expanded_entity_names: set[str] = set()
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

        # 通过反向索引，将扩展实体映射回真实关联chunk
        existing_ids = {c.get("id") for c in initial_chunks}
        expanded_chunk_ids = self.kg.get_chunk_ids_for_entities(list(expanded_entity_names))
        new_chunk_ids = [cid for cid in expanded_chunk_ids if cid not in existing_ids]

        if new_chunk_ids:
            related_chunks = await self._fetch_chunks_by_ids(new_chunk_ids)
            initial_chunks.extend(related_chunks)
            logger.debug(f"反向索引新增{len(related_chunks)}个关联chunk")

        # 将图关系作为额外的结构化context
        if graph_relations:
            graph_context = self._format_graph_relations(graph_relations)
            initial_chunks.append({
                "id": "graph_context",
                "content": graph_context,
                "metadata": {"type": "graph_structure"},
            })

        return initial_chunks

    async def _fetch_chunks_by_ids(self, chunk_ids: list[str]) -> list[dict[str, Any]]:
        """根据chunk_id从向量库回取chunk内容

        Args:
            chunk_ids: chunk ID列表

        Returns:
            chunk字典列表
        """
        if not chunk_ids:
            return []
        try:
            raw = await self._get_chroma_store().get_by_ids(chunk_ids)
        except Exception as e:
            logger.warning(f"按ID回取chunk失败: {e}")
            return []

        chunks: list[dict[str, Any]] = []
        ids = raw.get("ids", []) or []
        documents = raw.get("documents", []) or []
        metadatas = raw.get("metadatas", []) or []
        for i, cid in enumerate(ids):
            chunks.append({
                "id": cid,
                "content": documents[i] if i < len(documents) else "",
                "metadata": metadatas[i] if i < len(metadatas) else {},
            })
        return chunks

    def _match_entities(self, text: str) -> list[str]:
        """在文本中匹配图中已存在的实体

        通过jieba分词得到候选词，再与图节点集合做O(1)集合查询，
        避免O(nodes)的逐节点子串扫描，同时利用词边界减少误匹配
        （如"AI"不会命中"MAIN"）。对多字实体，额外做一次子串兜底，
        以覆盖分词无法切出的长实体名。

        Args:
            text: 待匹配文本

        Returns:
            命中的实体名称列表（去重）
        """
        if not text:
            return []

        node_set = self._get_node_set()
        if not node_set:
            return []

        matched: set[str] = set()

        try:
            import jieba

            tokens = {t.strip() for t in jieba.cut(text, cut_all=False) if t.strip()}
            matched.update(tokens & node_set)
        except ImportError:
            logger.debug("jieba不可用，回退到子串匹配")

        # 长实体（>=3字/词，分词难切）做一次子串兜底
        for node in self._get_long_nodes():
            if node not in matched and node in text:
                matched.add(node)

        return list(matched)

    def _get_node_set(self) -> set[str]:
        """缓存图节点集合，用于O(1)成员判断"""
        version = self.kg.graph.number_of_nodes()
        if getattr(self, "_node_set_version", None) != version:
            self._node_set_cache = set(self.kg.graph.nodes())
            self._long_nodes_cache = [n for n in self._node_set_cache if len(n) >= 3]
            self._node_set_version = version
        return self._node_set_cache

    def _get_long_nodes(self) -> list[str]:
        """长实体列表（子串兜底用），与节点集合共用版本缓存"""
        self._get_node_set()
        return self._long_nodes_cache

    def _extract_entity_names_from_chunks(self, chunks: list[dict[str, Any]]) -> list[str]:
        """从初始chunks中匹配图实体"""
        entities: set[str] = set()
        for chunk in chunks:
            entities.update(self._match_entities(chunk.get("content", "")))
        return list(entities)

    def _extract_entities_from_query(self, query: str) -> list[str]:
        """从查询中匹配图实体"""
        return self._match_entities(query)

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
