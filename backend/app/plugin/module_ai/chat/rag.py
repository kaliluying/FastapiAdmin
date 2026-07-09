from __future__ import annotations

from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from typing import Any, Protocol

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

from app.config.setting import settings
from app.core.logger import logger
from app.plugin.module_ai.knowledge.chroma_store import ChromaKnowledgeStore
from app.plugin.module_ai.knowledge.embedding import EmbeddingClient, create_embedding_client


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
        embedding_client: EmbeddingClient | None = None,
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
        raw = await self._get_store().query(
            query_embedding=embeddings[0],
            knowledge_base_ids=knowledge_base_ids,
            top_k=self.top_k,
        )
        return self._documents_from_chroma(raw)

    def _get_store(self) -> ChromaKnowledgeStore:
        if self.store is None:
            self.store = ChromaKnowledgeStore()
        return self.store

    def _get_embedding_client(self) -> EmbeddingClient:
        if self.embedding_client is None:
            self.embedding_client = create_embedding_client()
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
        session_history: list[dict[str, Any]] | None = None,
        memories: list[dict[str, Any]] | None = None,
        user_profile: dict[str, Any] | None = None,
    ) -> str:
        context = self._format_context(documents)
        prompt_parts = [
            "你是通用知识库智能助手。\n"
            "你的任务是根据用户问题和检索上下文，帮助用户梳理事实、提炼依据、形成可执行的下一步建议。\n"
            "请优先根据检索上下文回答；如果上下文不足，请明确说明不确定，并提示用户需要补充哪些事实或材料。\n"
            "不要编造不存在的资料，不要给出超出上下文支持的确定结论。\n"
            "回答必须包含：初步判断、依据方向、补充材料建议、下一步行动、风险提示。\n"
            "回答使用中文，表达清楚、具体、可执行。\n",
        ]

        # ── 个人中心信息：当前登录用户主动维护的背景资料 ──
        profile_text = self._format_user_profile(user_profile)
        if profile_text:
            prompt_parts.append("\n【个人中心信息——仅作为用户自述背景参考】\n")
            prompt_parts.append(profile_text)
            prompt_parts.append(
                "\n请把这些信息作为背景线索使用；如果与用户本轮描述或材料内容矛盾，"
                "请提示用户核对，不要直接替用户下最终结论。\n"
            )

        # ── 长期记忆：用户偏好/事实/工作规则 ──
        if memories:
            prompt_parts.append("\n【长期记忆——请始终遵循】\n")
            for m in memories:
                prompt_parts.append(f"- {m['key']}: {m['value']}\n")
            prompt_parts.append("\n")

        # ── 短期记忆：最近对话历史 ──
        if session_history:
            prompt_parts.append("\n【近期对话历史】\n")
            for turn in session_history[-6:]:  # 最近 3 轮 = 6 条消息
                role_tag = "用户" if turn.get("role") == "user" else "助手"
                prompt_parts.append(f"{role_tag}: {turn.get('content', '')}\n")
            prompt_parts.append("\n")

        prompt_parts.extend([
            f"用户: {user_id}\n"
            f"部门: {dept_id}\n"
            f"会话: {session_id or 'new'}\n\n"
            "检索上下文:\n"
            f"{context}\n\n"
            "用户问题:\n"
            f"{message}",
        ])
        return "".join(prompt_parts)

    @staticmethod
    def _format_user_profile(profile: dict[str, Any] | None) -> str:
        if not profile:
            return ""

        def has_value(value: Any) -> bool:
            return value is not None and value != ""

        field_specs = [
            ("name", "姓名", str),
            ("mobile", "手机号", str),
            ("email", "邮箱", str),
            ("description", "备注", str),
        ]

        lines = []
        for key, label, formatter in field_specs:
            value = profile.get(key)
            if has_value(value):
                lines.append(f"- {label}: {formatter(value)}")
        return "\n".join(lines)

    @staticmethod
    def _format_context(documents: list[RagDocument]) -> str:
        if not documents:
            return "无可用知识库上下文。"

        lines = []
        for index, doc in enumerate(documents, start=1):
            meta = doc.metadata
            chapter = meta.get("chapter", "")
            articles = meta.get("articles", "")
            summary = meta.get("summary", "")
            keywords = meta.get("keywords", "")

            # Build a structured legal citation when legal metadata is present.
            if chapter or articles:
                citation_parts = []
                if chapter:
                    citation_parts.append(chapter)
                if articles:
                    citation_parts.append(articles)
                citation = " ".join(citation_parts)

                header = f"[{index}] {citation}"
                if summary:
                    header += f"\n    摘要: {summary}"
                if keywords:
                    header += f"\n    关键词: {keywords}"
            else:
                # Fallback: show all metadata as flat key=value pairs.
                flat = ", ".join(
                    f"{key}={value}"
                    for key, value in meta.items()
                    if key not in ("distance", "chunk_index", "document_id", "knowledge_base_id")
                )
                header = f"[{index}]" + (f" ({flat})" if flat else "")

            lines.append(f"{header}\n{doc.content}")
        return "\n\n".join(lines)


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
        db: Any | None = None,
        user_id: str = "",
        team_id: str | None = None,
        user_profile: dict[str, Any] | None = None,
    ) -> None:
        self.retriever = retriever
        self.prompt_builder = prompt_builder
        self.chat_model = chat_model
        self.db = db
        self.user_id = user_id
        self.team_id = team_id
        self.user_profile = user_profile or {}

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

        # ── 短期记忆：从会话 runs 中提取最近对话历史 ──
        session_history: list[dict[str, Any]] = []
        if session_id and self.db:
            session_history = await self._fetch_session_history(session_id)

        # ── 长期记忆：从 ai_memory 表中读取活跃的用户记忆 ──
        memories: list[dict[str, Any]] = []
        if self.db and self.user_id:
            memories = await self._fetch_memories()

        return self.prompt_builder.build(
            message=message,
            documents=documents,
            user_id=user_id,
            dept_id=dept_id,
            session_id=session_id,
            session_history=session_history,
            memories=memories,
            user_profile=self.user_profile,
        )

    async def _fetch_session_history(self, session_id: str) -> list[dict[str, Any]]:
        """Extract recent messages from the session's runs field."""
        try:
            from sqlalchemy import select

            from app.plugin.module_ai.chat.model import ChatSessionModel

            result = await self.db.execute(
                select(ChatSessionModel).where(
                    ChatSessionModel.session_id == session_id,
                    ChatSessionModel.is_deleted == False,  # noqa: E712
                )
            )
            obj = result.scalars().first()
            if not obj or not obj.runs:
                return []
            messages: list[dict[str, Any]] = []
            runs = list(obj.runs or [])
            # Take only the last 3 runs (round-trips) for context
            for run in runs[-5:]:
                if not isinstance(run, dict):
                    continue
                for msg in run.get("messages", []) or []:
                    if not isinstance(msg, dict):
                        continue
                    role = msg.get("role")
                    if role in ("user", "assistant"):
                        messages.append({"role": role, "content": msg.get("content", "")})
            return messages
        except Exception as e:
            logger.warning(f"获取会话历史失败 (非致命): {e}")
            return []

    async def _fetch_memories(self) -> list[dict[str, Any]]:
        """Fetch active memories for the current user/dept."""
        try:
            from app.core.base_schema import AuthSchema
            from app.plugin.module_ai.memory.crud import MemoryCRUD

            # Build a minimal auth object for MemoryCRUD
            class _FakeUser:
                username = self.user_id
                dept_id = int(self.team_id) if self.team_id and self.team_id.isdigit() else None

            auth = AuthSchema(user=_FakeUser(), db=self.db)
            crud = MemoryCRUD(auth)
            entries = await crud.get_active_memories()
            return [entry.to_dict() for entry in entries]
        except Exception as e:
            logger.warning(f"获取长期记忆失败 (非致命): {e}")
            return []

class RagChainFactory:
    def create_chain(self, db: Any | None = None, auth: Any | None = None) -> RagChatChain:
        user_id = ""
        team_id = None
        user_profile: dict[str, Any] = {}
        if auth is not None:
            user = getattr(auth, "user", None)
            user_id = getattr(user, "username", None) or ""
            dept_id = getattr(user, "dept_id", None)
            team_id = str(dept_id) if dept_id else None
            user_profile = self._extract_user_profile(user)
        return RagChatChain(
            retriever=ChromaKnowledgeRetriever(),
            prompt_builder=RagPromptBuilder(),
            chat_model=LangChainChatModel(),
            db=db,
            user_id=user_id,
            team_id=team_id,
            user_profile=user_profile,
        )

    @staticmethod
    def _extract_user_profile(user: Any | None) -> dict[str, Any]:
        if user is None:
            return {}

        fields = (
            "name",
            "mobile",
            "email",
            "description",
        )
        profile: dict[str, Any] = {}
        for field_name in fields:
            value = getattr(user, field_name, None)
            if value is not None and value != "":
                profile[field_name] = value
        return profile
