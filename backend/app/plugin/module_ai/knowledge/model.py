from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base_model import ModelMixin, UserMixin


class KnowledgeBaseModel(ModelMixin, UserMixin):
    """Knowledge base metadata stored in MySQL."""

    __tablename__ = "ai_knowledge_base"
    __table_args__ = {"comment": "AI knowledge base"}
    __loader_options__: list[str] = ["created_by", "updated_by", "deleted_by"]

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True, comment="Knowledge base name")
    description: Mapped[str | None] = mapped_column(Text, default=None, nullable=True, comment="Description")
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("1"), nullable=False, index=True)
    owner_dept_id: Mapped[int | None] = mapped_column(Integer, default=None, nullable=True, index=True)

    documents: Mapped[list["KnowledgeDocumentModel"]] = relationship(
        "KnowledgeDocumentModel",
        back_populates="knowledge_base",
        cascade="all, delete-orphan",
    )


class KnowledgeDocumentModel(ModelMixin, UserMixin):
    """Document metadata and indexing status stored in MySQL."""

    __tablename__ = "ai_knowledge_document"
    __table_args__ = {"comment": "AI knowledge document"}
    __loader_options__: list[str] = ["knowledge_base", "created_by", "updated_by", "deleted_by"]

    knowledge_base_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ai_knowledge_base.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(500), default=None, nullable=True)
    file_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    file_size: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"), nullable=False)
    parse_status: Mapped[str] = mapped_column(String(32), default="pending", server_default=text("'pending'"), nullable=False, index=True)
    index_status: Mapped[str] = mapped_column(String(32), default="pending", server_default=text("'pending'"), nullable=False, index=True)
    error_message: Mapped[str | None] = mapped_column(Text, default=None, nullable=True)
    parsed_at: Mapped[datetime | None] = mapped_column(DateTime, default=None, nullable=True)
    indexed_at: Mapped[datetime | None] = mapped_column(DateTime, default=None, nullable=True)

    knowledge_base: Mapped[KnowledgeBaseModel] = relationship("KnowledgeBaseModel", back_populates="documents")
    chunks: Mapped[list["KnowledgeChunkModel"]] = relationship(
        "KnowledgeChunkModel",
        back_populates="document",
        cascade="all, delete-orphan",
    )


class KnowledgeChunkModel(ModelMixin, UserMixin):
    """Chunk metadata stored in MySQL; vector content lives in ChromaDB."""

    __tablename__ = "ai_knowledge_chunk"
    __table_args__ = {"comment": "AI knowledge chunk"}
    __loader_options__: list[str] = ["document", "created_by", "updated_by", "deleted_by"]

    knowledge_base_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ai_knowledge_base.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    document_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ai_knowledge_document.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"), nullable=False)
    chroma_id: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)

    document: Mapped[KnowledgeDocumentModel] = relationship("KnowledgeDocumentModel", back_populates="chunks")
