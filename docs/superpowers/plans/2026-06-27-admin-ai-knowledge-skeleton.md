# Admin AI Knowledge Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split this repository into a single-organization admin skeleton with AI knowledge-base capabilities backed by MySQL metadata and ChromaDB vector search.

**Architecture:** Keep the existing FastAPI/Vue admin foundation for auth, RBAC, menus, departments, dicts, params, logs, file upload, and AI chat. Remove tenant-facing runtime behavior and optional admin product features, then add a focused knowledge-base plugin where MySQL stores business state and ChromaDB stores embeddings/chunks for semantic retrieval.

**Tech Stack:** FastAPI, SQLAlchemy/Alembic, MySQL, ChromaDB, OpenAI-compatible chat and embedding APIs, Vue 3, TypeScript, Element Plus.

---

## File Structure

### Keep As Core Skeleton

- `backend/app/core/**`: base CRUD, auth dependencies, database, logging, middleware, router discovery.
- `backend/app/common/**`: response, request, enums, shared dataclasses.
- `backend/app/api/v1/module_system/auth/**`: login and current-user APIs, after tenant selection is removed.
- `backend/app/api/v1/module_system/user/**`: users.
- `backend/app/api/v1/module_system/role/**`: roles and permissions.
- `backend/app/api/v1/module_system/dept/**`: departments for internal organization scoping.
- `backend/app/api/v1/module_system/dict/**`: dictionaries.
- `backend/app/api/v1/module_system/params/**`: system parameters.
- `backend/app/api/v1/module_system/log/**`: operation/login logs.
- `backend/app/api/v1/module_platform/menu/**`: menus.
- `backend/app/api/v1/module_common/file/**`: uploads.
- `backend/app/plugin/module_ai/chat/**`: chat and session history, refactored to call knowledge retrieval.
- `frontend/web/src/views/module_system/{auth,user,role,dept,dict,params,log}/**`.
- `frontend/web/src/views/module_platform/menu/**`.
- `frontend/web/src/views/module_ai/chat/**`.
- `frontend/web/src/views/module_ai/memory/**`, renamed or relabeled as conversation history.

### Remove Or Disable From Runtime

- `backend/app/api/v1/module_platform/tenant/**`: remove route registration and seed initialization for single-organization mode.
- `frontend/web/src/views/module_platform/tenant/**`: remove tenant management page.
- Tenant switching and tenant registration in:
  - `frontend/web/src/api/module_system/auth.ts`
  - `frontend/web/src/store/modules/user.store.ts`
  - `frontend/web/src/store/modules/config.store.ts`
  - `frontend/web/src/components/layouts/fa-header-bar/widgets/FaUserMenu.vue`
  - `frontend/web/src/components/layouts/fa-header-bar/widgets/FaTenantSwitcher.vue`
  - `frontend/web/src/views/module_system/auth/login/index.vue`
- Optional modules to remove from menus/routes after tenant removal:
  - `backend/app/api/v1/module_monitor/**`
  - `backend/app/api/v1/module_system/ticket/**`
  - `backend/app/api/v1/module_system/notice/**`
  - `backend/app/api/v1/module_system/position/**`
  - `frontend/web/src/views/dashboard/{analysis,screen,workplace}/**`
  - `frontend/web/src/views/module_system/{ticket,notice,position}/**`

### Create For Knowledge Base

- `backend/app/plugin/module_ai/knowledge/model.py`: MySQL metadata models for knowledge bases, documents, and chunks.
- `backend/app/plugin/module_ai/knowledge/schema.py`: request/response/query schemas.
- `backend/app/plugin/module_ai/knowledge/crud.py`: SQLAlchemy persistence.
- `backend/app/plugin/module_ai/knowledge/chroma_store.py`: ChromaDB collection client and vector operations.
- `backend/app/plugin/module_ai/knowledge/text_splitter.py`: deterministic text chunking.
- `backend/app/plugin/module_ai/knowledge/extractors.py`: text extraction for `.txt`, `.md`, `.pdf`, `.docx`.
- `backend/app/plugin/module_ai/knowledge/embedding.py`: OpenAI-compatible embedding client.
- `backend/app/plugin/module_ai/knowledge/service.py`: orchestration for upload, parse, index, query test, delete/reindex.
- `backend/app/plugin/module_ai/knowledge/controller.py`: HTTP endpoints.
- `backend/app/plugin/module_ai/knowledge/__init__.py`.
- `frontend/web/src/api/module_ai/knowledge.ts`: API client and types.
- `frontend/web/src/views/module_ai/knowledge/index.vue`: knowledge-base management.
- `frontend/web/src/views/module_ai/document/index.vue`: document management.
- `frontend/web/src/views/module_ai/retrieval/index.vue`: retrieval test page.
- `tests/plugin/module_ai/knowledge/test_text_splitter.py`.
- `tests/plugin/module_ai/knowledge/test_chroma_store.py`.
- `tests/plugin/module_ai/knowledge/test_knowledge_service.py`.

---

### Task 1: Baseline And Safety Check

**Files:**
- Read: `backend/pyproject.toml`
- Read: `frontend/web/package.json`
- Read: `backend/app/config/setting.py`
- Read: `backend/app/scripts/initialize.py`
- Read: `backend/app/scripts/data/platform_menu.json`

- [ ] **Step 1: Confirm repository status**

Run:

```powershell
git status --short
```

Expected: capture existing unrelated changes before editing. Do not revert unrelated user changes.

- [ ] **Step 2: Compile backend baseline**

Run:

```powershell
cd backend
python -m compileall -q app
```

Expected: command exits `0`. If it fails on pre-existing encoding or syntax issues, record the failing file and continue only with files needed for this split.

- [ ] **Step 3: Type-check frontend baseline**

Run:

```powershell
cd frontend\web
pnpm run type-check
```

Expected: command exits `0`, or existing unrelated failures are recorded.

- [ ] **Step 4: Inspect seed menus**

Run:

```powershell
rg -n "tenant|notice|ticket|position|analysis|screen|workplace|module_ai|知识|AI" backend\app\scripts\data frontend\web\src -S
```

Expected: list all seed/menu references that must be updated in later tasks.

---

### Task 2: Disable Tenant Runtime For Single-Organization Mode

**Files:**
- Modify: `backend/app/config/setting.py`
- Modify: `backend/app/init_app.py`
- Modify: `backend/app/scripts/initialize.py`
- Modify: `backend/app/api/v1/module_platform/__init__.py`
- Test: `tests/core/test_single_org_runtime.py`

- [ ] **Step 1: Write the backend runtime test**

Create `tests/core/test_single_org_runtime.py`:

```python
from app.config.setting import settings
from app.scripts.initialize import InitializeData


def test_tenant_middleware_is_not_registered_for_single_org():
    assert "app.core.middlewares.TenantMiddleware" not in settings.MIDDLEWARE_LIST


def test_tenant_models_are_not_seeded_for_single_org():
    table_names = {model.__tablename__ for model in InitializeData.prepare_init_models}
    assert "platform_tenant" not in table_names
    assert "platform_tenant_user" not in table_names
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
cd backend
pytest tests\core\test_single_org_runtime.py -q
```

Expected: fail because `TenantMiddleware`, `TenantModel`, and `TenantUserModel` are currently present.

- [ ] **Step 3: Remove tenant middleware registration**

In `backend/app/config/setting.py`, change `MIDDLEWARE_LIST` so the list no longer contains:

```python
"app.core.middlewares.TenantMiddleware",
```

Keep `CustomCORSMiddleware`, `RequestLogMiddleware`, `CustomGZipMiddleware`, `SecurityHeadersMiddleware`, and `CorrelationIdMiddleware`.

- [ ] **Step 4: Remove tenant cache startup**

In `backend/app/init_app.py`, remove the import and startup call:

```python
from app.api.v1.module_platform.tenant.service import TenantService
await TenantService.init_cache(redis=app.state.redis)
```

Expected behavior: Redis startup remains only for generic Redis config/dict work.

- [ ] **Step 5: Remove tenant seed models**

In `backend/app/scripts/initialize.py`, remove:

```python
from app.api.v1.module_platform.tenant.model import TenantModel, TenantUserModel
TenantModel,
TenantUserModel,
```

Keep `MenuModel` as the first platform model.

- [ ] **Step 6: Remove tenant route registration from platform router**

In `backend/app/api/v1/module_platform/__init__.py`, remove the `TenantRouter` import and `platform_router.include_router(TenantRouter)`.

- [ ] **Step 7: Run backend test**

Run:

```powershell
cd backend
pytest tests\core\test_single_org_runtime.py -q
```

Expected: `2 passed`.

---

### Task 3: Remove Tenant UX And Tenant API Calls From Frontend Runtime

**Files:**
- Modify: `frontend/web/src/api/module_system/auth.ts`
- Modify: `frontend/web/src/store/modules/user.store.ts`
- Modify: `frontend/web/src/store/modules/config.store.ts`
- Modify: `frontend/web/src/components/layouts/fa-header-bar/widgets/FaUserMenu.vue`
- Delete or stop importing: `frontend/web/src/components/layouts/fa-header-bar/widgets/FaTenantSwitcher.vue`
- Modify: `frontend/web/src/views/module_system/auth/login/index.vue`
- Test: `frontend/web/src/__tests__/single-org-user-store.test.ts`

- [ ] **Step 1: Write frontend test for no tenant selection**

Create `frontend/web/src/__tests__/single-org-user-store.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import AuthAPI from "@/api/module_system/auth";

describe("single organization auth API", () => {
  it("does not expose tenant selection helpers", () => {
    expect("getTenants" in AuthAPI).toBe(false);
    expect("selectTenant" in AuthAPI).toBe(false);
    expect("tenantRegister" in AuthAPI).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
cd frontend\web
pnpm vitest run src\__tests__\single-org-user-store.test.ts
```

Expected: fail while tenant helpers exist.

- [ ] **Step 3: Remove tenant auth helpers**

In `frontend/web/src/api/module_system/auth.ts`, remove:

```ts
getTenants()
selectTenant(tenantId: number)
tenantRegister(body: TenantRegisterForm)
TenantRegisterForm
TenantRegisterResult
TenantOption
SelectTenantResult
```

Keep login, logout, refresh, current user, menu, captcha, and OAuth helpers.

- [ ] **Step 4: Remove tenant state from user store**

In `frontend/web/src/store/modules/user.store.ts`, remove state, actions, and persisted fields for:

```ts
tenantList
currentTenant
selectTenant
setCurrentTenant
getTenants
LAST_TENANT_ID_KEY
```

Keep token, user info, roles, permissions, menus, and logout logic.

- [ ] **Step 5: Remove tenant config lookup**

In `frontend/web/src/store/modules/config.store.ts`, remove import of `TenantAPI` and the call to `TenantAPI.getTenantConfigInfo(tenantId)`.

Keep system config loading.

- [ ] **Step 6: Remove tenant switcher UI**

In `frontend/web/src/components/layouts/fa-header-bar/widgets/FaUserMenu.vue`, remove the tenant dropdown block and its `storeToRefs` usage for `tenantList/currentTenant`.

If `FaTenantSwitcher.vue` is imported anywhere, remove that import and usage; then delete `FaTenantSwitcher.vue`.

- [ ] **Step 7: Remove tenant registration from login page**

In `frontend/web/src/views/module_system/auth/login/index.vue`, remove tenant self-registration form fields and calls to `AuthAPI.tenantRegister`.

Keep username/password login and optional OAuth login.

- [ ] **Step 8: Run frontend test**

Run:

```powershell
cd frontend\web
pnpm vitest run src\__tests__\single-org-user-store.test.ts
```

Expected: `1 passed`.

---

### Task 4: Prune Optional Admin Modules From Seed Menus And Runtime

**Files:**
- Modify: `backend/app/scripts/data/platform_menu.json`
- Modify: `backend/app/scripts/initialize.py`
- Delete or archive routes after tests pass:
  - `backend/app/api/v1/module_monitor`
  - `backend/app/api/v1/module_system/ticket`
  - `backend/app/api/v1/module_system/notice`
  - `backend/app/api/v1/module_system/position`
  - `frontend/web/src/views/module_platform/tenant`
  - `frontend/web/src/views/module_system/ticket`
  - `frontend/web/src/views/module_system/notice`
  - `frontend/web/src/views/module_system/position`
  - `frontend/web/src/views/dashboard/analysis`
  - `frontend/web/src/views/dashboard/screen`
  - `frontend/web/src/views/dashboard/workplace`
- Test: `tests/scripts/test_skeleton_seed_menu.py`

- [ ] **Step 1: Write seed menu test**

Create `tests/scripts/test_skeleton_seed_menu.py`:

```python
import json
from pathlib import Path


REMOVED_KEYWORDS = {
    "tenant",
    "ticket",
    "notice",
    "position",
    "monitor",
    "analysis",
    "screen",
    "workplace",
}


def flatten(items):
    for item in items:
        yield item
        yield from flatten(item.get("children", []))


def test_seed_menu_contains_only_skeleton_and_ai_knowledge_routes():
    path = Path("app/scripts/data/platform_menu.json")
    data = json.loads(path.read_text(encoding="utf-8"))
    serialized_routes = "\n".join(
        str(item.get("path", "")) + "\n" + str(item.get("component", "")) + "\n" + str(item.get("permission", ""))
        for item in flatten(data)
    ).lower()
    for keyword in REMOVED_KEYWORDS:
        assert keyword not in serialized_routes

    assert "module_ai" in serialized_routes
    assert "knowledge" in serialized_routes
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
cd backend
pytest tests\scripts\test_skeleton_seed_menu.py -q
```

Expected: fail while removed routes still exist and knowledge routes are missing.

- [ ] **Step 3: Rewrite seed menu**

Edit `backend/app/scripts/data/platform_menu.json` so the only top-level menu groups are:

```text
首页
系统管理
AI 知识库
```

Keep system menu children:

```text
用户管理
角色管理
部门管理
菜单管理
字典管理
参数配置
操作日志
```

Add AI children:

```text
AI 对话
会话记录
模型配置
知识库管理
文档管理
检索测试
```

Use permissions:

```text
module_ai:chat:query
module_ai:chat:detail
module_ai:model_config:query
module_ai:knowledge:query
module_ai:document:query
module_ai:retrieval:test
```

- [ ] **Step 4: Remove optional models from seed initializer**

In `backend/app/scripts/initialize.py`, remove imports and entries for:

```python
NoticeModel
NoticeReadModel
TicketModel
PositionModel
```

Keep `DeptModel`.

- [ ] **Step 5: Run seed menu test**

Run:

```powershell
cd backend
pytest tests\scripts\test_skeleton_seed_menu.py -q
```

Expected: `1 passed`.

---

### Task 5: Add Knowledge Base MySQL Models And Schemas

**Files:**
- Create: `backend/app/plugin/module_ai/knowledge/__init__.py`
- Create: `backend/app/plugin/module_ai/knowledge/model.py`
- Create: `backend/app/plugin/module_ai/knowledge/schema.py`
- Modify: `backend/app/scripts/initialize.py`
- Test: `tests/plugin/module_ai/knowledge/test_models.py`

- [ ] **Step 1: Write model metadata test**

Create `tests/plugin/module_ai/knowledge/test_models.py`:

```python
from app.plugin.module_ai.knowledge.model import KnowledgeBaseModel, KnowledgeChunkModel, KnowledgeDocumentModel


def test_knowledge_model_table_names():
    assert KnowledgeBaseModel.__tablename__ == "ai_knowledge_base"
    assert KnowledgeDocumentModel.__tablename__ == "ai_knowledge_document"
    assert KnowledgeChunkModel.__tablename__ == "ai_knowledge_chunk"
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
cd backend
pytest tests\plugin\module_ai\knowledge\test_models.py -q
```

Expected: import failure because models do not exist yet.

- [ ] **Step 3: Create knowledge models**

Create `backend/app/plugin/module_ai/knowledge/model.py` with SQLAlchemy models:

```python
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base_model import ModelMixin, UserMixin


class KnowledgeBaseModel(ModelMixin, UserMixin):
    __tablename__ = "ai_knowledge_base"
    __table_args__ = ({ "comment": "AI 知识库" },)

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True, comment="知识库名称")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="知识库描述")
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("1"), comment="是否启用")
    owner_dept_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True, comment="归属部门")

    documents: Mapped[list["KnowledgeDocumentModel"]] = relationship(back_populates="knowledge_base")


class KnowledgeDocumentModel(ModelMixin, UserMixin):
    __tablename__ = "ai_knowledge_document"
    __table_args__ = ({ "comment": "AI 知识库文档" },)

    knowledge_base_id: Mapped[int] = mapped_column(ForeignKey("ai_knowledge_base.id"), nullable=False, index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False, comment="文件名")
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True, comment="文件路径")
    file_type: Mapped[str] = mapped_column(String(32), nullable=False, comment="文件类型")
    file_size: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"), comment="文件大小")
    parse_status: Mapped[str] = mapped_column(String(32), default="pending", server_default=text("'pending'"), index=True)
    index_status: Mapped[str] = mapped_column(String(32), default="pending", server_default=text("'pending'"), index=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    parsed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    indexed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    knowledge_base: Mapped[KnowledgeBaseModel] = relationship(back_populates="documents")
    chunks: Mapped[list["KnowledgeChunkModel"]] = relationship(back_populates="document")


class KnowledgeChunkModel(ModelMixin, UserMixin):
    __tablename__ = "ai_knowledge_chunk"
    __table_args__ = ({ "comment": "AI 知识库文档切片" },)

    knowledge_base_id: Mapped[int] = mapped_column(ForeignKey("ai_knowledge_base.id"), nullable=False, index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("ai_knowledge_document.id"), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    chroma_id: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)

    document: Mapped[KnowledgeDocumentModel] = relationship(back_populates="chunks")
```

- [ ] **Step 4: Create schemas**

Create `backend/app/plugin/module_ai/knowledge/schema.py` with create/update/query/out schemas for knowledge bases and documents. Include fields:

```python
name
description
is_enabled
owner_dept_id
knowledge_base_id
file_name
file_type
parse_status
index_status
chunk_count
```

- [ ] **Step 5: Register models for table creation**

In `backend/app/scripts/initialize.py`, import:

```python
from app.plugin.module_ai.knowledge.model import KnowledgeBaseModel, KnowledgeChunkModel, KnowledgeDocumentModel
```

Append to `prepare_init_models`:

```python
KnowledgeBaseModel,
KnowledgeDocumentModel,
KnowledgeChunkModel,
```

- [ ] **Step 6: Run model test**

Run:

```powershell
cd backend
pytest tests\plugin\module_ai\knowledge\test_models.py -q
```

Expected: `1 passed`.

---

### Task 6: Add ChromaDB Store And Embedding Client

**Files:**
- Modify: `backend/pyproject.toml`
- Modify: `backend/requirements.txt`
- Create: `backend/app/plugin/module_ai/knowledge/chroma_store.py`
- Create: `backend/app/plugin/module_ai/knowledge/embedding.py`
- Test: `tests/plugin/module_ai/knowledge/test_chroma_store.py`

- [ ] **Step 1: Add failing Chroma store test**

Create `tests/plugin/module_ai/knowledge/test_chroma_store.py`:

```python
from app.plugin.module_ai.knowledge.chroma_store import ChromaKnowledgeStore


def test_build_metadata_filter_for_knowledge_base():
    store = ChromaKnowledgeStore(collection_name="test_collection")
    assert store.build_where_filter(knowledge_base_ids=[1, 2]) == {
        "knowledge_base_id": {"$in": [1, 2]}
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
cd backend
pytest tests\plugin\module_ai\knowledge\test_chroma_store.py -q
```

Expected: import failure because `chroma_store.py` does not exist.

- [ ] **Step 3: Add dependencies**

Add to `backend/pyproject.toml` and `backend/requirements.txt`:

```text
chromadb>=0.5.23,<0.6
pypdf>=5.1.0,<6
python-docx>=1.1.2,<2
```

- [ ] **Step 4: Implement Chroma store**

Create `backend/app/plugin/module_ai/knowledge/chroma_store.py`:

```python
from __future__ import annotations

from typing import Any

import chromadb

from app.config.setting import settings


class ChromaKnowledgeStore:
    def __init__(self, persist_dir: str | None = None, collection_name: str | None = None) -> None:
        self.persist_dir = persist_dir or settings.CHROMA_PERSIST_DIR
        self.collection_name = collection_name or settings.CHROMA_COLLECTION_NAME
        self.client = chromadb.PersistentClient(path=self.persist_dir)
        self.collection = self.client.get_or_create_collection(name=self.collection_name)

    @staticmethod
    def build_where_filter(knowledge_base_ids: list[int] | None = None) -> dict[str, Any] | None:
        if not knowledge_base_ids:
            return None
        if len(knowledge_base_ids) == 1:
            return {"knowledge_base_id": knowledge_base_ids[0]}
        return {"knowledge_base_id": {"$in": knowledge_base_ids}}

    def upsert_chunks(self, *, ids: list[str], embeddings: list[list[float]], documents: list[str], metadatas: list[dict[str, Any]]) -> None:
        self.collection.upsert(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)

    def query(self, *, query_embedding: list[float], knowledge_base_ids: list[int], top_k: int = 5) -> dict[str, Any]:
        return self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=self.build_where_filter(knowledge_base_ids),
            include=["documents", "metadatas", "distances"],
        )

    def delete_document(self, document_id: int) -> None:
        self.collection.delete(where={"document_id": document_id})
```

- [ ] **Step 5: Implement embedding client**

Create `backend/app/plugin/module_ai/knowledge/embedding.py`:

```python
from openai import AsyncOpenAI

from app.config.setting import settings


class OpenAICompatibleEmbeddingClient:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_BASE_URL)

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        response = await self.client.embeddings.create(model=settings.OPENAI_EMBEDDING_MODEL, input=texts)
        return [item.embedding for item in response.data]
```

Also add `OPENAI_EMBEDDING_MODEL: str = ""` to `backend/app/config/setting.py`.

- [ ] **Step 6: Run Chroma store test**

Run:

```powershell
cd backend
pytest tests\plugin\module_ai\knowledge\test_chroma_store.py -q
```

Expected: `1 passed`.

---

### Task 7: Add Text Extraction And Chunking

**Files:**
- Create: `backend/app/plugin/module_ai/knowledge/text_splitter.py`
- Create: `backend/app/plugin/module_ai/knowledge/extractors.py`
- Test: `tests/plugin/module_ai/knowledge/test_text_splitter.py`

- [ ] **Step 1: Write text splitter tests**

Create `tests/plugin/module_ai/knowledge/test_text_splitter.py`:

```python
from app.plugin.module_ai.knowledge.text_splitter import split_text


def test_split_text_uses_overlap():
    chunks = split_text("abcdefghijklmnopqrstuvwxyz", chunk_size=10, overlap=2)
    assert chunks == ["abcdefghij", "ijklmnopqr", "qrstuvwxyz"]


def test_split_text_ignores_empty_input():
    assert split_text("   ", chunk_size=10, overlap=2) == []
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
cd backend
pytest tests\plugin\module_ai\knowledge\test_text_splitter.py -q
```

Expected: import failure.

- [ ] **Step 3: Implement splitter**

Create `backend/app/plugin/module_ai/knowledge/text_splitter.py`:

```python
def split_text(text: str, *, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    normalized = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    if not normalized:
        return []
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks: list[str] = []
    start = 0
    while start < len(normalized):
        end = min(start + chunk_size, len(normalized))
        chunks.append(normalized[start:end])
        if end == len(normalized):
            break
        start = end - overlap
    return chunks
```

- [ ] **Step 4: Implement extractors**

Create `backend/app/plugin/module_ai/knowledge/extractors.py`:

```python
from pathlib import Path

from docx import Document
from pypdf import PdfReader


def extract_text(path: str | Path) -> str:
    file_path = Path(path)
    suffix = file_path.suffix.lower()
    if suffix in {".txt", ".md"}:
        return file_path.read_text(encoding="utf-8", errors="ignore")
    if suffix == ".pdf":
        reader = PdfReader(str(file_path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if suffix == ".docx":
        document = Document(str(file_path))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    raise ValueError(f"unsupported knowledge document type: {suffix}")
```

- [ ] **Step 5: Run splitter tests**

Run:

```powershell
cd backend
pytest tests\plugin\module_ai\knowledge\test_text_splitter.py -q
```

Expected: `2 passed`.

---

### Task 8: Add Knowledge CRUD, Service, And API

**Files:**
- Create: `backend/app/plugin/module_ai/knowledge/crud.py`
- Create: `backend/app/plugin/module_ai/knowledge/service.py`
- Create: `backend/app/plugin/module_ai/knowledge/controller.py`
- Test: `tests/plugin/module_ai/knowledge/test_knowledge_service.py`

- [ ] **Step 1: Write service test with fakes**

Create `tests/plugin/module_ai/knowledge/test_knowledge_service.py`:

```python
from app.plugin.module_ai.knowledge.service import build_chroma_metadata


def test_build_chroma_metadata_contains_required_filters():
    metadata = build_chroma_metadata(
        knowledge_base_id=3,
        document_id=9,
        chunk_index=2,
        file_name="handbook.md",
    )
    assert metadata == {
        "knowledge_base_id": 3,
        "document_id": 9,
        "chunk_index": 2,
        "file_name": "handbook.md",
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
cd backend
pytest tests\plugin\module_ai\knowledge\test_knowledge_service.py -q
```

Expected: import failure.

- [ ] **Step 3: Implement metadata helper and service orchestration**

Create `backend/app/plugin/module_ai/knowledge/service.py` with:

```python
def build_chroma_metadata(*, knowledge_base_id: int, document_id: int, chunk_index: int, file_name: str) -> dict[str, int | str]:
    return {
        "knowledge_base_id": knowledge_base_id,
        "document_id": document_id,
        "chunk_index": chunk_index,
        "file_name": file_name,
    }
```

Then add `KnowledgeService` methods:

```text
create_knowledge_base
update_knowledge_base
delete_knowledge_base
page_knowledge_bases
upload_document
index_document
delete_document
query_retrieval
```

Each method must write MySQL state through `crud.py` and write/delete vectors through `ChromaKnowledgeStore`.

- [ ] **Step 4: Implement CRUD**

Create `backend/app/plugin/module_ai/knowledge/crud.py` with methods matching service needs:

```text
create_base
update_base
delete_base
list_bases
create_document
update_document_status
replace_chunks
list_documents
delete_document
```

Use existing `async_db_session`/`AuthSchema` patterns from nearby modules.

- [ ] **Step 5: Implement controller**

Create `backend/app/plugin/module_ai/knowledge/controller.py` with `APIRouter` prefix `/knowledge`, including endpoints:

```text
GET    /knowledge/list
POST   /knowledge/create
PUT    /knowledge/update/{id}
DELETE /knowledge/delete
GET    /knowledge/document/list
POST   /knowledge/document/upload
POST   /knowledge/document/{id}/reindex
DELETE /knowledge/document/delete
POST   /knowledge/retrieval/test
```

Use permissions:

```text
module_ai:knowledge:query
module_ai:knowledge:create
module_ai:knowledge:update
module_ai:knowledge:delete
module_ai:document:query
module_ai:document:create
module_ai:document:delete
module_ai:retrieval:test
```

- [ ] **Step 6: Run service test**

Run:

```powershell
cd backend
pytest tests\plugin\module_ai\knowledge\test_knowledge_service.py -q
```

Expected: `1 passed`.

---

### Task 9: Wire Knowledge Retrieval Into AI Chat

**Files:**
- Modify: `backend/app/plugin/module_ai/chat/schema.py`
- Modify: `backend/app/plugin/module_ai/chat/rag.py`
- Modify: `backend/app/plugin/module_ai/chat/service.py`
- Modify: `frontend/web/src/api/module_ai/chat.ts`
- Modify: `frontend/web/src/views/module_ai/chat/index.vue`
- Modify: `frontend/web/src/views/module_ai/chat/components/FaChatNavbar.vue`
- Test: `tests/plugin/module_ai/chat/test_rag_retriever_selection.py`

- [ ] **Step 1: Write retriever selection test**

Create `tests/plugin/module_ai/chat/test_rag_retriever_selection.py`:

```python
from app.plugin.module_ai.chat.schema import ChatQuerySchema


def test_chat_query_accepts_knowledge_base_ids():
    query = ChatQuerySchema(message="制度是什么", knowledge_base_ids=[1, 2])
    assert query.knowledge_base_ids == [1, 2]
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
cd backend
pytest tests\plugin\module_ai\chat\test_rag_retriever_selection.py -q
```

Expected: fail because `knowledge_base_ids` is missing.

- [ ] **Step 3: Extend chat schema**

In `backend/app/plugin/module_ai/chat/schema.py`, add:

```python
knowledge_base_ids: list[int] = Field(default_factory=list, description="参与检索的知识库 ID")
```

to both streaming and non-streaming chat request schemas.

- [ ] **Step 4: Replace keyword retriever with Chroma retriever**

In `backend/app/plugin/module_ai/chat/rag.py`, add a `ChromaKnowledgeRetriever` that:

```text
embeds query through OpenAICompatibleEmbeddingClient
queries ChromaKnowledgeStore with knowledge_base_ids
returns RagDocument objects containing content and source metadata
falls back to file-only context when no knowledge_base_ids are selected
```

Keep `KeywordKnowledgeRetriever` only as a test fallback or remove it after Chroma retrieval is covered.

- [ ] **Step 5: Pass knowledge base selection from service**

In `backend/app/plugin/module_ai/chat/service.py`, pass `query.knowledge_base_ids` into `chain.astream` and `chain.ainvoke`.

- [ ] **Step 6: Add knowledge base selector to chat UI**

In `frontend/web/src/views/module_ai/chat/index.vue`, load enabled knowledge bases through `KnowledgeAPI.listKnowledgeBase`, store selected IDs, and include them in websocket/non-stream chat payloads.

- [ ] **Step 7: Run chat schema test**

Run:

```powershell
cd backend
pytest tests\plugin\module_ai\chat\test_rag_retriever_selection.py -q
```

Expected: `1 passed`.

---

### Task 10: Add Frontend Knowledge Base Pages

**Files:**
- Create: `frontend/web/src/api/module_ai/knowledge.ts`
- Create: `frontend/web/src/views/module_ai/knowledge/index.vue`
- Create: `frontend/web/src/views/module_ai/document/index.vue`
- Create: `frontend/web/src/views/module_ai/retrieval/index.vue`
- Test: `frontend/web/src/__tests__/knowledge-api.test.ts`

- [ ] **Step 1: Write API test**

Create `frontend/web/src/__tests__/knowledge-api.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import KnowledgeAPI from "@/api/module_ai/knowledge";

describe("KnowledgeAPI", () => {
  it("exposes knowledge, document, and retrieval methods", () => {
    expect(typeof KnowledgeAPI.listKnowledgeBase).toBe("function");
    expect(typeof KnowledgeAPI.uploadDocument).toBe("function");
    expect(typeof KnowledgeAPI.testRetrieval).toBe("function");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
cd frontend\web
pnpm vitest run src\__tests__\knowledge-api.test.ts
```

Expected: import failure.

- [ ] **Step 3: Implement API client**

Create `frontend/web/src/api/module_ai/knowledge.ts` with methods:

```text
listKnowledgeBase
createKnowledgeBase
updateKnowledgeBase
deleteKnowledgeBase
listDocument
uploadDocument
reindexDocument
deleteDocument
testRetrieval
```

Use base path:

```ts
const API_PATH = "/ai/knowledge";
```

- [ ] **Step 4: Implement knowledge management page**

Create `frontend/web/src/views/module_ai/knowledge/index.vue` with a table for name, description, status, owner department, created time, and actions for create/update/delete.

- [ ] **Step 5: Implement document management page**

Create `frontend/web/src/views/module_ai/document/index.vue` with knowledge-base filter, upload button, parse/index status columns, reindex button, and delete button.

- [ ] **Step 6: Implement retrieval test page**

Create `frontend/web/src/views/module_ai/retrieval/index.vue` with knowledge-base selector, query input, top-k selector, and result list showing chunk text and source metadata.

- [ ] **Step 7: Run API test**

Run:

```powershell
cd frontend\web
pnpm vitest run src\__tests__\knowledge-api.test.ts
```

Expected: `1 passed`.

---

### Task 11: Clean Dependencies, Environment, And Documentation

**Files:**
- Modify: `backend/pyproject.toml`
- Modify: `backend/requirements.txt`
- Modify: `backend/env/.env.dev.example`
- Modify: `frontend/web/package.json`
- Modify: `README.md`
- Modify: `backend/README.md`

- [ ] **Step 1: Keep required backend dependencies**

Keep:

```text
fastapi
sqlalchemy
alembic
asyncmy
pymysql
redis
openai
chromadb
pypdf
python-docx
aiofiles
python-multipart
```

Remove only after `rg` proves unused:

```text
weasyprint
pandas
openpyxl
fastapi-mail
aiosmtplib
psutil
ua-parser
agno
```

Do not remove `agno` until chat session persistence is migrated away from `ChatSessionCRUD`.

- [ ] **Step 2: Add AI knowledge env vars**

In `backend/env/.env.dev.example`, include:

```env
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=
OPENAI_EMBEDDING_MODEL=
CHROMA_PERSIST_DIR=./data/chroma
CHROMA_COLLECTION_NAME=knowledge_base
```

- [ ] **Step 3: Clean frontend dependencies after route deletion**

Run:

```powershell
cd frontend\web
rg -n "vue-web-terminal|vue3-cron-plus|xgplayer|@vue-flow|dagre|wangeditor|codemirror|echarts|exceljs|xlsx" src package.json -S
```

Remove packages only when no remaining source imports require them.

- [ ] **Step 4: Rewrite README**

Rewrite `README.md` to describe:

```text
Single-organization admin skeleton
MySQL for business metadata
ChromaDB for vector retrieval
AI knowledge-base module
How to start backend/frontend
How to configure OpenAI-compatible chat and embedding models
```

---

### Task 12: Verification

**Files:**
- Verify backend and frontend commands.

- [ ] **Step 1: Backend targeted tests**

Run:

```powershell
cd backend
pytest tests\core\test_single_org_runtime.py tests\scripts\test_skeleton_seed_menu.py tests\plugin\module_ai -q
```

Expected: all targeted tests pass.

- [ ] **Step 2: Backend compile**

Run:

```powershell
cd backend
python -m compileall -q app tests
```

Expected: exits `0`.

- [ ] **Step 3: Backend lint on touched files**

Run:

```powershell
cd backend
uv run ruff check app\plugin\module_ai app\scripts\initialize.py app\config\setting.py app\init_app.py tests --output-format concise
```

Expected: no lint errors in touched files.

- [ ] **Step 4: Frontend tests**

Run:

```powershell
cd frontend\web
pnpm vitest run src\__tests__\single-org-user-store.test.ts src\__tests__\knowledge-api.test.ts
```

Expected: all frontend tests pass.

- [ ] **Step 5: Frontend type check**

Run:

```powershell
cd frontend\web
pnpm run type-check
```

Expected: exits `0`.

- [ ] **Step 6: Dependency import check**

Run:

```powershell
cd backend
python -c "import chromadb, openai, pypdf, docx"
```

Expected: exits `0`.

---

## Self-Review

- Spec coverage: The plan covers single-organization mode, tenant removal from runtime and frontend, optional admin pruning, MySQL metadata models, ChromaDB storage, document ingestion, RAG chat integration, frontend knowledge pages, dependency cleanup, and verification.
- Placeholder scan: No `TBD` or `TODO` placeholders remain. The only "after tests pass" phrase is tied to specific deletion targets and verification commands.
- Type consistency: Knowledge IDs use `int`, Chroma vector IDs use `str`, and chat requests use `knowledge_base_ids: list[int]` consistently.
