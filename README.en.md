# Admin

A frontend-backend separated admin project with a FastAPI backend and a Vue 3 frontend.

## Structure

```txt
backend/    Backend service
frontend/   Frontend app
```

## Backend

```bash
cd backend
python main.py run --env=dev
```

Common commands:

```bash
python main.py revision --env=dev
python main.py upgrade --env=dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Notes

- The default site name is `Admin`.
- Default image assets are served from `/api/v1/static/image/`.
- If a database already exists, also review the `sys_param` table for site title, copyright, documentation, and agreement links.
