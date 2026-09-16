# Frontend Service — React 18 Static Application & Nginx Reverse Proxy

Production-grade single-page application (SPA) developed with React 18, bundled using Vite, and served via an unprivileged Nginx web server for the **MA Soft Tech Solutions** DevOps assessment.

---

## 📋 Features

- **Branding & Assets**: Displays official **MA SOFT TECH SOLUTIONS** logo asset (`src/assets/logo.jpg`).
- **Live Health Monitor**: Real-time telemetry badge and raw JSON inspector polling the `/health` endpoint.
- **Interactive API Test Bench**: Test form for `/api/v1/items` demonstrating both valid creation (201) and schema rejection (400) with visual HTTP status badges.
- **Reverse Proxy Architecture**: In production, Nginx proxies `/api/*` and `/health` requests directly to the backend service.
- **Container Security**: Runs on `nginxinc/nginx-unprivileged:alpine` as non-root user `nginx` (UID 101).
- **Code Quality**: ESLint 9 (0 errors, 0 warnings) and Vitest component test suite (3 passing tests).

---

## ⚙️ Environment Variables

Configure via `.env`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL for development |
| `VITE_APP_TITLE` | `"MA SOFT TECH SOLUTIONS - DevOps Portal"` | Application page title |

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run linting (0 errors, 0 warnings)
npm run lint

# 3. Run automated tests (3 tests)
npm test

# 4. Start Vite dev server (with API proxying)
npm run dev
```
Development portal opens on: `http://localhost:3000`

```bash
# 5. Build static production assets
npm run build
```
Outputs compiled, minified static bundle to `frontend/dist/`.

---

## 🐳 Docker Deployment

The frontend uses a multi-stage Docker build:
- **Stage 1 (`builder`)**: Node 22 compiles the React SPA into static assets using Vite.
- **Stage 2 (`runner`)**: Unprivileged Nginx (`nginx:101`) serves the static assets and applies security headers and reverse proxy rules.

```bash
# Build standalone image
docker build -t ma-devops-frontend .

# Run standalone container on port 3000 (maps to container non-root port 8080)
docker run -d -p 3000:8080 --name frontend-container ma-devops-frontend
```
