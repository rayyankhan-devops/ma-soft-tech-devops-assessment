# MA SOFT TECH SOLUTIONS — DevOps Engineering Project

[![Backend Tests](https://img.shields.io/badge/backend%20tests-11%20passed-brightgreen.svg)](#1-backend-service-backend)
[![Frontend Tests](https://img.shields.io/badge/frontend%20tests-3%20passed-brightgreen.svg)](#2-frontend-service-frontend)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/database-MySQL%208.0-orange.svg)](https://www.mysql.com)

Decoupled, production-grade DevOps engineering assessment project for **MA SOFT TECH SOLUTIONS**. 

---

## 🗂️ Clean Directory Structure

The project root consists strictly of the **4 core service directories**:

```
.
├── backend/                        # Independent Node.js / Express API Service
│   ├── package.json
│   ├── vitest.config.js
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   ├── src/
│   │   ├── config.js               # Environment config loader
│   │   ├── db.js                   # MySQL pool & resilient fallback engine
│   │   ├── app.js                  # Express middleware & route definitions
│   │   ├── server.js               # Server entry point & graceful shutdown
│   │   └── routes/
│   │       ├── health.js           # /health with DB connectivity status
│   │       └── items.js            # /api/v1/items CRUD with SQL & validation
│   └── tests/
│       └── api.test.js             # Automated API integration tests (11 tests)
├── frontend/                       # Independent React.js Static Application
│   ├── package.json
│   ├── vite.config.js
│   ├── vitest.config.js
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   ├── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.jpg            # Official MA SOFT TECH company logo
│   │   ├── App.jsx                 # Dashboard with live telemetry & API tester
│   │   ├── App.css                 # Responsive dark-mode styling
│   │   └── main.jsx                # React root mount
│   └── tests/
│       ├── setup.js                # Testing environment setup
│       └── App.test.jsx            # React component unit tests (3 tests)
├── db/                             # Database Initialization & Seed Scripts
│   └── init/
│       └── mysql/
│           ├── 01_schema.sql       # Table schema creation (executed first by MySQL)
│           └── 02_seed.sql         # Pre-loaded initial data (executed second)
└── requirements/                   # Assessment Documents & Assets
    ├── MA_SOFT_TECH_SOLUTIONS_DevOps_Internship_Assessment.pdf
    └── assets/
        └── unnamed.jpg             # Original company logo
```

---

## 🚀 Running & Testing Each Service Separately

Each service is completely self-contained and run exclusively from its own directory.

### 1. Backend Service (`backend/`)

```bash
cd backend
npm install
```

#### Run Code Quality & Linting
```bash
npm run lint
```
*Result: 0 errors, 0 warnings (ESLint configured for Node.js / ES2022).*

#### Run Automated Tests
```bash
npm test
```
*Result: 11 passing automated tests verifying health metrics, database queries, and input validation.*

#### Start Backend API
```bash
npm start
```
- **Listening on**: `http://localhost:8080`
- **Health Check**: `http://localhost:8080/health`
- **Items API**: `http://localhost:8080/api/v1/items`

---

### 2. Frontend Service (`frontend/`)

```bash
cd frontend
npm install
```

#### Run Code Quality & Linting
```bash
npm run lint
```
*Result: 0 errors, 0 warnings (ESLint configured for React 18 & Hooks).*

#### Run Automated Tests
```bash
npm test
```
*Result: 3 passing automated tests verifying component rendering, branding logo, and test forms.*

#### Start React Development Server
```bash
npm run dev
```
- **Web Portal**: `http://localhost:3000` (automatically proxies API requests to port `8080`).

#### Build Static Production Bundle
```bash
npm run build
```
Outputs optimized static assets to `frontend/dist/`.

#### Preview Production Static Build
```bash
npm run preview
```
- **Preview Portal**: `http://localhost:4173`

---

---

## 🐳 Running with Docker Compose (Full Stack Orchestration)

Launch the entire decoupled ecosystem (Frontend, Backend, and MySQL) with a single command:

```bash
docker compose up --build -d
```

### Containers Created & Health Checks:
- **`ma-devops-mysql`** (`mysql:8.0`): Listens on `3306`. Mounts `./db/init/mysql:/docker-entrypoint-initdb.d:ro` to automatically execute `01_schema.sql` and `02_seed.sql`.
- **`ma-devops-backend`** (`node:22-alpine`): Listens on `8080`. Waits for MySQL to be healthy before starting (`depends_on: db: condition: service_healthy`).
- **`ma-devops-frontend`** (`nginx:alpine`): Listens on `3000`. Serves compiled React static assets and reverse proxies `/api` and `/health` requests to backend.

### Live Stack Status:
```bash
docker compose ps
```
Output:
```
NAME                 IMAGE                           STATUS                   PORTS
ma-devops-mysql      mysql:8.0                       Up (healthy)             0.0.0.0:3306->3306/tcp
ma-devops-backend    interviewandassement-backend    Up (healthy)             0.0.0.0:8080->8080/tcp
ma-devops-frontend   interviewandassement-frontend   Up (healthy)             0.0.0.0:3000->80/tcp
```

### Stop Containers:
```bash
docker compose down
# Or to remove persistent volumes:
docker compose down -v
```

---

## ⚡ Docker Optimization Challenge (Part 5 Requirements)

| Category | Optimization Implementation | Production Benefit |
| :--- | :--- | :--- |
| **Image Size** | Multi-stage builds + minimal `alpine` base images (`node:22-alpine`, `nginx:alpine`). | Backend reduced to **244MB**; Frontend static image reduced to **93MB** (vs >1.1GB standard Node images). |
| **Build Speed & Layer Caching** | Cached dependency layer (`COPY package*.json ./` followed by `npm ci` before copying source code). | Rebuilding after application code changes takes seconds; dependency resolution is reused from cache. |
| **Security & Non-Root** | Switched execution to `USER node` (UID 1000) in backend; removed compilers and shell utilities from final stages. | Prevents container breakout vulnerabilities; non-root user cannot modify container host or root filesystem. |
| **Dependency Management** | Installed only production dependencies (`npm ci --omit=dev && npm cache clean --force`). | Excludes testing and development dependencies (Vitest, Supertest, ESLint) from production containers. |
| **Runtime Permissions** | File ownership set explicitly via `chown -R node:node /app`. | Follows the principle of least privilege for container processes. |
| **Health Probes** | Native `HEALTHCHECK` instructions in Dockerfiles and `condition: service_healthy` in compose. | Eliminates startup race conditions and allows orchestrators to detect deadlocks. |

