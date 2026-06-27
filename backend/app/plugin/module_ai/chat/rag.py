from __future__ import annotations

from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from typing import Any, Protocol

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

from app.config.setting import settings
from app.plugin.module_ai.knowledge.chroma_store import ChromaKnowledgeStore
from app.plugin.module_ai.knowledge.embedding import OpenAICompatibleEmbeddingClient


@dataclass(slots=True)
class RagDocument:
    """A retrieved knowledge fragment used to ground the model answer."""

    content: str
    metadata: dict[str, Any] = field(default_factory=dict)


class Retriever(Protocol):
    async def retrieve(
        self,
        *,
        query: str,
        user_id: str,
        dept_id: str,
        session_id: str | None,
        knowledge_base_ids: list[int] | None = None,
        files: list[dict[str, Any]] | None = None,
    ) -> list[RagDocument]:
        """Return context documents for a user query."""


class ChatModel(Protocol):
    async def complete(self, prompt: str) -> str:
        """Return one complete answer."""

    async def stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """Yield answer chunks."""


class KeywordKnowledgeRetriever:
    """Small dependency-free retriever that mirrors a LangChain retriever seam.

    The built-in documents keep the existing admin navigation behavior useful.
    File payloads from the frontend are treated as ad-hoc documents for the
    current request, so the chain can already behave like a lightweight RAG flow.
    """

    def __init__(self, documents: list[RagDocument] | None = None, top_k: int = 4) -> None:
        self.documents = documents or self._default_documents()
        self.top_k = top_k

    async def retrieve(
        self,
        *,
        query: str,
        user_id: str,
        dept_id: str,
        session_id: str | None,
        knowledge_base_ids: list[int] | None = None,
        files: list[dict[str, Any]] | None = None,
    ) -> list[RagDocument]:
        candidates = [*self._documents_from_files(files), *self.documents]
        if not candidates:
            return []

        query_tokens = self._tokenize(query)
        scored: list[tuple[int, RagDocument]] = []
        for doc in candidates:
            score = self._score(doc, query, query_tokens)
            if score > 0:
                scored.append((score, doc))

        scored.sort(key=lambda item: item[0], reverse=True)
        return [doc for _, doc in scored[: self.top_k]]

    @staticmethod
    def _default_documents() -> list[RagDocument]:
        return [
            RagDocument(
                content="用户管理页面用于维护系统用户，路由路径是 /system/user。",
                metadata={"source": "system-menu", "name": "用户管理"},
            ),
            RagDocument(
                content="角色管理页面用于配置角色和权限，路由路径是 /system/role。",
                metadata={"source": "system-menu", "name": "角色管理"},
            ),
            RagDocument(
                content="菜单管理页面用于维护菜单、按钮和接口权限，路由路径是 /system/menu。",
                metadata={"source": "system-menu", "name": "菜单管理"},
            ),
            RagDocument(
                content="部门管理页面用于维护组织架构，路由路径是 /system/dept。",
                metadata={"source": "system-menu", "name": "部门管理"},
            ),
            RagDocument(
                content="字典管理页面用于维护系统字典类型和字典数据，路由路径是 /system/dict。",
                metadata={"source": "system-menu", "name": "字典管理"},
            ),
            RagDocument(
                content="系统日志页面用于查看登录日志和操作日志，路由路径是 /system/log。",
                metadata={"source": "system-menu", "name": "系统日志"},
            ),
        ]

    @staticmethod
    def _documents_from_files(files: list[dict[str, Any]] | None) -> list[RagDocument]:
        documents: list[RagDocument] = []
        for index, file in enumerate(files or []):
            content = file.get("content") or file.get("text") or file.get("summary")
            if not isinstance(content, str) or not content.strip():
                continue
            name = file.get("name") or file.get("filename") or f"file-{index + 1}"
            documents.append(
                RagDocument(
                    content=content.strip(),
                    metadata={"source": "uploaded-file", "name": str(name)},
                )
            )
        return documents

    @staticmethod
    def _tokenize(text: str) -> set[str]:
        normalized = text.lower()
        tokens = {part for part in normalized.replace("/", " ").replace("_", " ").split() if part}
        for keyword in ("用户", "角色", "菜单", "部门", "字典", "日志", "权限", "路由", "路径"):
            if keyword in text:
                tokens.add(keyword)
        return tokens

    def _score(self, doc: RagDocument, query: str, query_tokens: set[str]) -> int:
        content = doc.content.lower()
        metadata_text = " ".join(str(value) for value in doc.metadata.values()).lower()
        searchable = f"{content} {metadata_text}"
        score = sum(2 for token in query_tokens if token in searchable)
        if query and query.lower() in searchable:
            score += 4
        return score


class ChromaKnowledgeRetriever:
    """Retriever backed by ChromaDB for persisted knowledge-base chunks."""

    def __init__(
        self,
        *,
        store: ChromaKnowledgeStore | None = None,
        embedding_client: OpenAICompatibleEmbeddingClient | None = None,
        top_k: int = 5,
    ) -> None:
        self.store = store
        self.embedding_client = embedding_client
        self.top_k = top_k
        self.file_retriever = KeywordKnowledgeRetriever(documents=[], top_k=top_k)

    async def retrieve(
        self,
        *,
        query: str,
        user_id: str,
        dept_id: str,
        session_id: str | None,
        knowledge_base_ids: list[int] | None = None,
        files: list[dict[str, Any]] | None = None,
    ) -> list[RagDocument]:
        if not knowledge_base_ids:
            return await self.file_retriever.retrieve(
                query=query,
                user_id=user_id,
                dept_id=dept_id,
                session_id=session_id,
                files=files,
            )

        embeddings = await self._get_embedding_client().embed_texts([query])
        raw = self._get_store().query(
            query_embedding=embeddings[0],
            knowledge_base_ids=knowledge_base_ids,
            top_k=self.top_k,
        )
        return self._documents_from_chroma(raw)

    def _get_store(self) -> ChromaKnowledgeStore:
        if self.store is None:
            self.store = ChromaKnowledgeStore()
        return self.store

    def _get_embedding_client(self) -> OpenAICompatibleEmbeddingClient:
        if self.embedding_client is None:
            self.embedding_client = OpenAICompatibleEmbeddingClient()
        return self.embedding_client

    @staticmethod
    def _documents_from_chroma(raw: dict[str, Any]) -> list[RagDocument]:
        documents = (raw.get("documents") or [[]])[0] or []
        metadatas = (raw.get("metadatas") or [[]])[0] or []
        distances = (raw.get("distances") or [[]])[0] or []
        result: list[RagDocument] = []
        for index, content in enumerate(documents):
            metadata = dict(metadatas[index] if index < len(metadatas) and metadatas[index] else {})
            if index < len(distances):
                metadata["distance"] = distances[index]
            result.append(RagDocument(content=str(content), metadata=metadata))
        return result


class RagPromptBuilder:
    def build(
        self,
        *,
        message: str,
        documents: list[RagDocument],
        user_id: str,
        dept_id: str,
        session_id: str | None,
    ) -> str:
        context = self._format_context(documents)
        return (
            "你是 FastapiAdmin 后台管理系统的 AI 助手。\n"
            "请优先根据检索上下文回答；如果上下文不足，请明确说明不确定，并给出可执行的下一步建议。\n"
            "回答使用中文，保持简洁、准确。涉及页面跳转时可以直接给出路由路径。\n\n"
            f"用户: {user_id}\n"
            f"部门: {dept_id}\n"
            f"会话: {session_id or 'new'}\n\n"
            "检索上下文:\n"
            f"{context}\n\n"
            "用户问题:\n"
            f"{message}"
        )

    @staticmethod
    def _format_context(documents: list[RagDocument]) -> str:
        if not documents:
            return "无可用知识库上下文。"

        lines = []
        for index, doc in enumerate(documents, start=1):
            metadata = ", ".join(f"{key}={value}" for key, value in doc.metadata.items())
            source = f" ({metadata})" if metadata else ""
            lines.append(f"[{index}]{source} {doc.content}")
        return "\n".join(lines)


class LangChainChatModel:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            model=settings.OPENAI_MODEL,
            temperature=0.7,
        )

    async def complete(self, prompt: str) -> str:
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        content = response.content
        if isinstance(content, str):
            return content
        return "".join(str(part) for part in content)

    async def stream(self, prompt: str) -> AsyncGenerator[str, None]:
        async for chunk in self.llm.astream([HumanMessage(content=prompt)]):
            content = chunk.content
            if isinstance(content, str) and content:
                yield content
            elif isinstance(content, list):
                text = "".join(str(part) for part in content)
                if text:
                    yield text


class RagChatChain:
    def __init__(
        self,
        *,
        retriever: Retriever,
        prompt_builder: RagPromptBuilder,
        chat_model: ChatModel,
    ) -> None:
        self.retriever = retriever
        self.prompt_builder = prompt_builder
        self.chat_model = chat_model

    async def ainvoke(
        self,
        *,
        message: str,
        user_id: str,
        dept_id: str,
        session_id: str | None,
        knowledge_base_ids: list[int] | None = None,
        files: list[dict[str, Any]] | None = None,
    ) -> str:
        prompt = await self._build_prompt(
            message=message,
            user_id=user_id,
            dept_id=dept_id,
            session_id=session_id,
            knowledge_base_ids=knowledge_base_ids,
            files=files,
        )
        return await self.chat_model.complete(prompt)

    async def astream(
        self,
        *,
        message: str,
        user_id: str,
        dept_id: str,
        session_id: str | None,
        knowledge_base_ids: list[int] | None = None,
        files: list[dict[str, Any]] | None = None,
    ) -> AsyncGenerator[str, None]:
        prompt = await self._build_prompt(
            message=message,
            user_id=user_id,
            dept_id=dept_id,
            session_id=session_id,
            knowledge_base_ids=knowledge_base_ids,
            files=files,
        )
        async for chunk in self.chat_model.stream(prompt):
            yield chunk

    async def _build_prompt(
        self,
        *,
        message: str,
        user_id: str,
        dept_id: str,
        session_id: str | None,
        knowledge_base_ids: list[int] | None,
        files: list[dict[str, Any]] | None,
    ) -> str:
        documents = await self.retriever.retrieve(
            query=message,
            user_id=user_id,
            dept_id=dept_id,
            session_id=session_id,
            knowledge_base_ids=knowledge_base_ids,
            files=files,
        )
        return self.prompt_builder.build(
            message=message,
            documents=documents,
            user_id=user_id,
            dept_id=dept_id,
            session_id=session_id,
        )


class RagChainFactory:
    def create_chain(self, db: Any | None = None) -> RagChatChain:
        return RagChatChain(
            retriever=ChromaKnowledgeRetriever(),
            prompt_builder=RagPromptBuilder(),
            chat_model=LangChainChatModel(),
        )
