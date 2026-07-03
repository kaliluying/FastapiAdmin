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
        evidence_analyses: list[dict[str, Any]] | None = None,
    ) -> str:
        context = self._format_context(documents)
        prompt_parts = [
            "你是劳动仲裁智能辅助助手。\n"
            "你的任务是根据用户描述和检索上下文，帮助用户整理劳动争议事实、初步维权思路、证据建议和下一步行动。\n"
            "请优先根据检索上下文回答；如果上下文不足，请明确说明不确定，并提示用户需要补充哪些事实或证据。\n"
            "不要冒充律师，不要给出最终法律结论，不要承诺仲裁结果。\n"
            "回答必须包含：初步判断、依据方向、证据建议、下一步行动、风险提示。\n"
            "回答使用中文，表达清楚、具体、可执行。\n",
        ]

        # ── 证据分析结果：当前会话中已上传并完成 AI 分析的证据材料 ──
        if evidence_analyses:
            prompt_parts.append("\n【已分析证据材料——回答问题时请充分参考】\n")
            prompt_parts.append(
                "以下证据已经过 AI 分析，包含关键事实、证明目的、关联诉求、证据强度、风险和缺失材料。\n"
                "请在回答时：1）优先引用这些证据中的关键事实支撑你的判断；"
                "2）如果用户的问题与某条证据相关，明确指出该证据及分析结论；"
                "3）如果多条证据之间存在矛盾或互补关系，请一并指出；"
                "4）证据强度和风险提示应如实告知用户，不得弱化或隐瞒。\n\n"
            )
            prompt_parts.append(self._format_evidence_analyses(evidence_analyses))
            prompt_parts.append("\n")

        # ── 个人中心信息：当前登录用户主动维护的劳动仲裁相关背景 ──
        profile_text = self._format_user_profile(user_profile)
        if profile_text:
            prompt_parts.append("\n【个人中心信息——仅作为用户自述背景参考】\n")
            prompt_parts.append(profile_text)
            prompt_parts.append(
                "\n请把这些信息作为案件背景线索使用；如果与用户本轮描述或证据材料矛盾，"
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

        def format_salary(value: Any) -> str:
            try:
                amount = float(value)
            except (TypeError, ValueError):
                return f"{value}元"
            if amount.is_integer():
                return f"{int(amount)}元"
            return f"{amount:.2f}元"

        def format_social_insurance(value: Any) -> str:
            if value is True:
                return "是"
            if value is False:
                return "否"
            return str(value)

        field_specs = [
            ("name", "姓名", str),
            ("mobile", "手机号", str),
            ("email", "邮箱", str),
            ("company_name", "公司名称", str),
            ("position_name", "岗位", str),
            ("monthly_salary", "月工资", format_salary),
            ("hire_date", "入职日期", str),
            ("contract_type", "合同类型", str),
            ("social_insurance", "是否缴纳社保", format_social_insurance),
            ("description", "备注", str),
        ]

        lines = []
        for key, label, formatter in field_specs:
            value = profile.get(key)
            if has_value(value):
                lines.append(f"- {label}: {formatter(value)}")
        return "\n".join(lines)

    @staticmethod
    def _format_evidence_analyses(analyses: list[dict[str, Any]]) -> str:
        """将证据分析结果列表格式化为自然的结构化段落。

        保留关键事实、证明目的、关联诉求、证据强度、风险和缺失材料，
        以清晰但自然的方式呈现，避免生硬拼接。
        """
        lines: list[str] = []
        for index, ev in enumerate(analyses, start=1):
            file_name = ev.get("file_name", "未知文件")
            evidence_type = ev.get("evidence_type") or "未分类"
            strength = ev.get("evidence_strength") or "未评估"
            summary = ev.get("summary") or ""

            # 证据标题行
            lines.append(f"### 证据 {index}：{file_name}（类型：{evidence_type}，强度：{strength}）")

            # 分析摘要——作为概述最先展示
            if summary:
                lines.append(f"概述：{summary}")

            # 关键事实
            key_facts = ev.get("key_facts") or []
            if key_facts:
                facts_text = "；".join(str(f) for f in key_facts)
                lines.append(f"关键事实：{facts_text}")

            # 证明目的
            proof_purpose = ev.get("proof_purpose") or []
            if proof_purpose:
                purpose_text = "；".join(str(p) for p in proof_purpose)
                lines.append(f"证明目的：{purpose_text}")

            # 关联诉求
            related_claims = ev.get("related_claims") or []
            if related_claims:
                claims_text = "；".join(str(c) for c in related_claims)
                lines.append(f"关联诉求：{claims_text}")

            # 风险提示
            risks = ev.get("risks") or []
            if risks:
                risks_text = "；".join(str(r) for r in risks)
                lines.append(f"风险提示：{risks_text}")

            # 建议补充材料
            missing = ev.get("missing_materials") or []
            if missing:
                missing_text = "；".join(str(m) for m in missing)
                lines.append(f"建议补充材料：{missing_text}")

            lines.append("")  # 空行分隔不同证据
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

        # ── 证据分析结果：从 ai_evidence_analysis 表中读取已分析的证据 ──
        evidence_analyses: list[dict[str, Any]] = []
        if self.db and session_id:
            evidence_analyses = await self._fetch_evidence_analyses(session_id)

        return self.prompt_builder.build(
            message=message,
            documents=documents,
            user_id=user_id,
            dept_id=dept_id,
            session_id=session_id,
            session_history=session_history,
            memories=memories,
            user_profile=self.user_profile,
            evidence_analyses=evidence_analyses,
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
            from app.plugin.module_ai.memory.crud import MemoryCRUD
            from app.core.base_schema import AuthSchema

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

    async def _fetch_evidence_analyses(self, session_id: str) -> list[dict[str, Any]]:
        """Fetch analyzed evidence results for the current session."""
        try:
            from app.plugin.module_ai.evidence.crud import EvidenceAnalysisCRUD
            from app.core.base_schema import AuthSchema

            class _FakeUser:
                username = self.user_id
                dept_id = int(self.team_id) if self.team_id and self.team_id.isdigit() else None

            auth = AuthSchema(user=_FakeUser(), db=self.db)
            crud = EvidenceAnalysisCRUD(auth)
            return await crud.get_analyzed_by_session(session_id=session_id)
        except Exception as e:
            logger.warning(f"获取证据分析结果失败 (非致命): {e}")
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
            "company_name",
            "position_name",
            "monthly_salary",
            "hire_date",
            "contract_type",
            "social_insurance",
            "description",
        )
        profile: dict[str, Any] = {}
        for field_name in fields:
            value = getattr(user, field_name, None)
            if value is not None and value != "":
                profile[field_name] = value
        return profile
