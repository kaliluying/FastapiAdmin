# FastapiAdmin

FastapiAdmin is a single-organization admin application with user and role permissions, menus, system configuration, audit logs, AI chat, knowledge bases, and document retrieval. The backend uses FastAPI; the frontend uses Vue 3.

For the current module map, startup flow, data ownership, development steps, and end-to-end acceptance path, see the [architecture and development guide](docs/ARCHITECTURE_AND_DEVELOPMENT.md) (Chinese). The [Chinese README](README.md) is the primary project entry point.

## Code and documentation

| Location | Purpose |
| --- | --- |
| [`backend/`](backend/README.md) | FastAPI service, system and AI modules, database startup, backend tests |
| [`frontend/`](frontend/README.md) | Vue application, login state, authorized menus, dynamic routes |
| [`docs/ARCHITECTURE_AND_DEVELOPMENT.md`](docs/ARCHITECTURE_AND_DEVELOPMENT.md) | Cross-layer architecture and development workflow |

The backend entry point is `backend/main.py`; the frontend entry point is `frontend/src/main.ts`. Backend dependencies and frontend scripts are defined by `backend/pyproject.toml` and `frontend/package.json`.

## Local development

Use Python 3.12+, `uv`, Node.js 20.19+, and the pnpm version declared in `frontend/package.json`. Prepare the database and Redis selected by your backend environment file. Configure the frontend proxy and WebSocket targets in `.env` and `.env.development`; values in the example file may be overridden by the current development file.

```bash
# From the repository root
cp backend/env/.env.dev.example backend/env/.env.dev

# Terminal 1
cd backend
uv sync
uv run main.py run --env=dev

# Terminal 2, from the repository root
cd frontend
pnpm install
pnpm dev
```

Backend startup applies existing Alembic migrations, creates missing tables, and seeds base data in the configured database. Check that target before starting. Core AI dependencies are included in `uv sync`; no extra `ai` dependency group is needed. The guide covers model configuration, indexing status, tests, and full user-flow verification.
