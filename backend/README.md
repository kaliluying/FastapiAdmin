# Admin Backend

FastAPI backend for the admin system.

## Stack

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- Redis
- APScheduler

## Common Commands

```bash
python main.py run --env=dev
python main.py revision --env=dev
python main.py upgrade --env=dev
```

## Structure

```txt
app/
  api/        API modules
  common/     shared constants and helpers
  config/     configuration
  core/       database, middleware, security
  plugin/     app initialization
  scripts/    initialization data
  utils/      utility functions
sql/          database initialization scripts
static/       static assets
```
