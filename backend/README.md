# Backend

FastAPI backend for the single-organization admin. AI knowledge-base and RAG capabilities are core backend features.

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

AI/vector settings are part of the core backend configuration:

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

`requirements.txt` exports the complete backend profile, including AI dependencies.

Application startup applies committed Alembic migrations when revision files
exist. This skeleton currently has no revision files, so startup creates tables
from the active ORM models before seeding data. Use `uv run main.py revision
--env=dev` to generate migrations when the project begins tracking schema
history; review and commit them before deployment. Multi-replica production
deployments should still run one dedicated migration job.

Application startup seeds base data when tables are empty, including the AI tables and menu permissions.

Uploaded files are stored under the private `storage/upload` directory. Generic
files are served through an authenticated preview route, while avatar and
parameter images use the validated public-image route; API responses expose
root-relative paths instead of server filesystem paths.

## Verification

```powershell
uv run pytest tests\core\test_ai_core_module.py -q
uv run pytest tests\plugin\module_ai -q
python -m compileall -q app tests
uv run ruff check app\plugin\module_ai app\scripts\initialize.py app\api\v1\module_system\__init__.py app\config\setting.py app\init_app.py tests --output-format concise
uv run python -c "import chromadb, fastembed, openai, pypdf, docx"
```

## Notes

- The Chroma persist directory must be writable for document indexing and retrieval.
- Knowledge document upload supports `.txt`, `.md`, `.pdf`, and `.docx`.
- User-edited model endpoints are blocked when they resolve to local/private networks; configure `MODEL_ALLOWED_HOSTS` only for explicitly trusted provider hosts.
- API keys are not exposed by the model-config endpoint; it only reports whether the key is configured.
- Missing AI dependencies are treated as a startup error; run `uv sync` before starting the backend.
