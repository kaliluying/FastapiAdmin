# Backend

FastAPI backend for the single-organization admin. AI knowledge-base and RAG capabilities are installed as an optional `ai` extra.

## Runtime Scope

The backend keeps the admin foundation:

- Auth and current-user APIs
- RBAC permissions and menu authorization
- Users, roles, menus, dictionaries, params, and audit logs
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

AI/vector settings are only required after installing the AI extra:

```env
AI_ENABLE=True
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
# Core admin only
uv sync
uv run main.py run --env=dev

# Enable AI knowledge-base and RAG
uv sync --extra ai
# Set AI_ENABLE=True in env/.env.dev
```

`requirements.txt` exports the core backend profile. Use `requirements-ai.txt` for deployments that enable AI.

Alembic revision `000000000001` manages the core admin tables, and revision
`000000000003` creates the optional AI tables when `AI_ENABLE=True` and the AI
dependencies are installed. Application startup applies committed migrations
before initializing seed data. Use `uv run main.py revision --env=dev` to
generate migrations, review and commit them, and let startup apply them; do
not generate migration files during startup. Multi-replica production
deployments should still run one dedicated migration job.

Application startup seeds base data when tables are empty. Optional AI tables still require the AI models to be installed and included in the deployment migration workflow.

Uploaded files are stored under the private `storage/upload` directory. Generic
files are served through an authenticated preview route, while avatar and
parameter images use the validated public-image route; API responses expose
root-relative paths instead of server filesystem paths.

## Verification

```powershell
uv run pytest tests\core\test_optional_ai_plugin.py -q
uv run --extra ai pytest tests\plugin\module_ai -q
python -m compileall -q app tests
uv run ruff check app\plugin\module_ai app\scripts\initialize.py app\api\v1\module_system\__init__.py app\config\setting.py app\init_app.py tests --output-format concise
uv run --extra ai python -c "import chromadb, fastembed, openai, pypdf, docx"
```

## Notes

- The Chroma persist directory must be writable for document indexing and retrieval.
- Knowledge document upload supports `.txt`, `.md`, `.pdf`, and `.docx`.
- User-edited model endpoints are blocked when they resolve to local/private networks; configure `MODEL_ALLOWED_HOSTS` only for explicitly trusted provider hosts.
- API keys are not exposed by the model-config endpoint; it only reports whether the key is configured.
- When `AI_ENABLE=True` but the `ai` extra is absent, the backend logs the missing modules and starts without the AI plugin.
