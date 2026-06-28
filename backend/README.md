# Backend

FastAPI backend for the single-organization admin + AI knowledge-base skeleton.

## Runtime Scope

The backend keeps the admin foundation:

- Auth and current-user APIs
- RBAC permissions and menu authorization
- Users, roles, departments, menus, dictionaries, params, logs
- Common file upload
- AI chat and session history
- AI knowledge-base metadata and document indexing

Tenant runtime is disabled for this skeleton. Tenant middleware, tenant cache startup, tenant seed models, and tenant route registration are not part of the active application.

## Knowledge Base Architecture

- MySQL stores knowledge bases, documents, chunks, parse/index status, audit fields, and file metadata.
- ChromaDB stores vectors and chunk documents.
- `chromadb.PersistentClient` stores vectors in the local Chroma persist directory.
- Chat completions use the `openai` client through OpenAI-compatible providers.
- Embeddings default to the local `fastembed` model `BAAI/bge-small-zh-v1.5`; OpenAI-compatible embeddings remain available by setting `EMBEDDING_PROVIDER=openai`.

Key modules:

```txt
app/plugin/module_ai/chat/
app/plugin/module_ai/knowledge/
```

## Environment

Copy and edit the development env file:

```powershell
copy env\.env.dev.example env\.env.dev
```

Required AI/vector settings:

```env
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=
EMBEDDING_PROVIDER=local
LOCAL_EMBEDDING_MODEL=BAAI/bge-small-zh-v1.5
LOCAL_EMBEDDING_CACHE_DIR=./data/fastembed
OPENAI_EMBEDDING_MODEL=
CHROMA_PERSIST_DIR=./data/chroma
CHROMA_COLLECTION_NAME=knowledge_base
```

`CHROMA_PERSIST_DIR` is the active local Chroma data directory. Preserve it during deployment, backup, and migration.
When changing embedding models, clear the existing Chroma collection or use a new `CHROMA_COLLECTION_NAME` to avoid vector dimension conflicts.

## Start

```powershell
uv sync
uv run main.py run --env=dev
```

On first startup, the app creates tables and seeds base data when tables are empty.

## Verification

```powershell
uv run pytest tests\core\test_single_org_runtime.py tests\scripts\test_skeleton_seed_menu.py tests\plugin\module_ai -q
python -m compileall -q app tests
uv run ruff check app\plugin\module_ai app\scripts\initialize.py app\api\v1\module_system\__init__.py app\config\setting.py app\init_app.py tests --output-format concise
uv run python -c "import chromadb, fastembed, openai, pypdf, docx"
```

## Notes

- The Chroma persist directory must be writable for document indexing and retrieval.
- Knowledge document upload supports `.txt`, `.md`, `.pdf`, and `.docx`.
- API keys are not exposed by the model-config endpoint; it only reports whether the key is configured.
