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
- `chromadb-client` connects to a Chroma HTTP server.
- `openai` client is used for both chat completions and embeddings through OpenAI-compatible providers.

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
OPENAI_EMBEDDING_MODEL=
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_SSL=false
CHROMA_COLLECTION_NAME=knowledge_base
```

`CHROMA_PERSIST_DIR` is retained only as reserved local deployment metadata. The active implementation uses Chroma HTTP client.

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
uv run python -c "import chromadb, openai, pypdf, docx"
```

## Notes

- A running Chroma server is required for document indexing and retrieval.
- Knowledge document upload supports `.txt`, `.md`, `.pdf`, and `.docx`.
- API keys are not exposed by the model-config endpoint; it only reports whether the key is configured.
