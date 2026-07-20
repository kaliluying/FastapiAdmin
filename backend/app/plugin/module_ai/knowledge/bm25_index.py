"""BM25全文检索索引模块

使用Whoosh实现BM25算法的关键词检索，用于混合检索场景。
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import anyio
from whoosh import index
from whoosh.fields import ID, STORED, TEXT, Schema

from app.config.setting import settings
from app.core.logger import logger


class BM25KnowledgeIndex:
    """基于Whoosh的BM25全文检索索引

    提供文档块的关键词检索能力，与向量检索互补：
    - 向量检索：语义相似度
    - BM25检索：关键词精确匹配
    """

    def __init__(self, index_dir: str | None = None, tokenizer: str | None = None) -> None:
        """初始化BM25索引

        Args:
            index_dir: 索引存储目录，默认从配置读取
            tokenizer: 分词器类型，"char"(单字) 或 "jieba"(词组)，默认从配置读取
        """
        self.index_dir = Path(index_dir or getattr(settings, "BM25_INDEX_DIR", str(settings.BASE_DIR / "data" / "bm25_index")))
        self.index_dir.mkdir(parents=True, exist_ok=True)

        self.tokenizer_type = tokenizer or getattr(settings, "BM25_TOKENIZER", "jieba")

        self.schema = Schema(
            chunk_id=ID(stored=True, unique=True),
            content=TEXT(stored=True, analyzer=self._create_analyzer()),
            knowledge_base_id=ID(stored=True),
            document_id=ID(stored=True),
            chunk_index=STORED(),
            file_name=STORED(),
        )

        self._index = None

    def _create_analyzer(self):
        """创建中文分词器

        根据配置选择：
        - char: 单字分词（召回率高，适合短查询）
        - jieba: 词组分词（准确率高，适合长文本）
        """
        if self.tokenizer_type == "jieba":
            try:
                from .jieba_analyzer import create_jieba_analyzer

                logger.info("使用jieba分词器（词组级）")
                return create_jieba_analyzer()
            except ImportError:
                logger.warning("jieba未安装，回退到单字分词")
                self.tokenizer_type = "char"

        # 默认：单字分词
        from whoosh.analysis import LowercaseFilter, RegexTokenizer

        logger.info("使用单字分词器")
        tokenizer = RegexTokenizer(r"[一-龥]|[a-zA-Z]+|\d+")
        return tokenizer | LowercaseFilter()

    def _get_index(self):
        """获取或创建索引实例（延迟加载）"""
        if self._index is None:
            if index.exists_in(str(self.index_dir)):
                self._index = index.open_dir(str(self.index_dir))
            else:
                self._index = index.create_in(str(self.index_dir), self.schema)
        return self._index

    async def add_chunks(
        self,
        chunks: list[dict[str, Any]],
    ) -> None:
        """批量添加文档块到BM25索引

        Args:
            chunks: 文档块列表，每个元素包含:
                - id: chunk主键
                - content: 文本内容
                - knowledge_base_id: 知识库ID
                - document_id: 文档ID
                - chunk_index: 块索引
                - file_name: 文件名
        """
        if not chunks:
            return

        def _write():
            ix = self._get_index()
            writer = ix.writer()
            try:
                for chunk in chunks:
                    writer.add_document(
                        chunk_id=str(chunk["id"]),
                        content=chunk["content"],
                        knowledge_base_id=str(chunk["knowledge_base_id"]),
                        document_id=str(chunk["document_id"]),
                        chunk_index=chunk.get("chunk_index", 0),
                        file_name=chunk.get("file_name", ""),
                    )
                writer.commit()
                logger.info(f"BM25索引写入成功: {len(chunks)} 个文档块")
            except Exception as e:
                writer.cancel()
                logger.error(f"BM25索引写入失败: {e}")
                raise

        await anyio.to_thread.run_sync(_write)

    async def search(
        self,
        query: str,
        knowledge_base_ids: list[int],
        top_k: int = 20,
    ) -> list[dict[str, Any]]:
        """BM25关键词检索

        Args:
            query: 查询文本
            knowledge_base_ids: 知识库ID列表（过滤范围）
            top_k: 返回结果数量

        Returns:
            检索结果列表，每个元素包含:
                - chunk_id: 文档块ID
                - content: 文本内容
                - score: BM25评分
                - knowledge_base_id: 知识库ID
                - document_id: 文档ID
        """
        if not query.strip():
            return []

        def _search():
            ix = self._get_index()
            results = []

            with ix.searcher() as searcher:
                # 使用QueryParser，传入分词器保持一致
                from whoosh.qparser import OrGroup, QueryParser

                parser = QueryParser("content", ix.schema, group=OrGroup)

                # 尝试解析查询，如果失败则使用原始查询
                try:
                    q = parser.parse(query)
                except Exception:
                    # 查询解析失败，使用通配符查询
                    from whoosh.query import Term
                    q = Term("content", query)

                search_results = searcher.search(q, limit=top_k * 2)  # 过滤前多召回一些

                kb_id_set = {str(kb_id) for kb_id in knowledge_base_ids}

                for hit in search_results:
                    # 过滤知识库范围
                    if hit["knowledge_base_id"] not in kb_id_set:
                        continue

                    results.append({
                        "chunk_id": hit["chunk_id"],
                        "content": hit["content"],
                        "score": hit.score,
                        "knowledge_base_id": int(hit["knowledge_base_id"]),
                        "document_id": int(hit["document_id"]),
                        "chunk_index": hit.get("chunk_index", 0),
                        "file_name": hit.get("file_name", ""),
                    })

                    if len(results) >= top_k:
                        break

            return results

        return await anyio.to_thread.run_sync(_search)

    async def delete_by_document(self, document_id: int) -> None:
        """删除指定文档的所有chunk索引

        Args:
            document_id: 文档ID
        """
        def _delete():
            ix = self._get_index()
            writer = ix.writer()
            try:
                writer.delete_by_term("document_id", str(document_id))
                writer.commit()
                logger.info(f"BM25索引删除成功: document_id={document_id}")
            except Exception as e:
                writer.cancel()
                logger.error(f"BM25索引删除失败: {e}")
                raise

        await anyio.to_thread.run_sync(_delete)

    async def clear_index(self) -> None:
        """清空整个索引"""
        def _clear():
            # 先关闭索引
            if self._index:
                self._index.close()
                self._index = None

            # 等待文件句柄释放
            import time
            time.sleep(0.1)

            # 删除索引目录
            import shutil
            if self.index_dir.exists():
                try:
                    shutil.rmtree(self.index_dir)
                except PermissionError:
                    # Windows上可能文件被锁定，稍后重试
                    time.sleep(0.5)
                    shutil.rmtree(self.index_dir)

            # 重建空索引
            self.index_dir.mkdir(parents=True, exist_ok=True)
            self._index = index.create_in(str(self.index_dir), self.schema)
            logger.info("BM25索引已清空")

        await anyio.to_thread.run_sync(_clear)

    def __del__(self):
        """析构函数：关闭索引"""
        if self._index:
            try:
                self._index.close()
            except Exception:
                pass
