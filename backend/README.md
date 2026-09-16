# Backend Service — Express REST API & MySQL Engine

Production-grade Node.js/Express API service engineered for the **MA Soft Tech Solutions** DevOps assessment. Provides health telemetry, input-validated RESTful CRUD endpoints, and resilient MySQL database connection pooling.

---

## 📋 Features

- **Health Check (`GET /health`)**: Returns JSON telemetry including uptime, memory usage, Node version, and database connectivity.
- **Items CRUD API (`/api/v1/items`)**:
  - `GET /api/v1/items`: Retrieves all items (`200 OK`).
  - `GET /api/v1/items/:id`: Retrieves single item by ID (`200 OK` or `404 Not Found`).
  - `POST /api/v1/items`: Schema validation on title length and priority enums (`400 Bad Request` or `201 Created`).
  - `DELETE /api/v1/items/:id`: Removes item by ID (`200 OK` or `404 Not Found`).
- **Resilient Database Layer (`src/db.js`)**: Connects to MySQL with automatic fallback to in-memory store during testing or offline runs.
- **Container Security**: Hardened multi-stage Dockerfile running as non-root user `node` (UID 1000).
- **Code Quality**: ESLint 9 (0 errors, 0 warnings) and Vitest test suite (11 passing tests).

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` to configure:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `8080` | HTTP listening port |
| `NODE_ENV` | `production` | Environment mode (`development`, `production`, `test`) |
| `APP_NAME` | `MA-DevOps-Backend` | Service identification string |
| `APP_VERSION` | `1.0.0` | Semantic application version |
| `DB_HOST` | `localhost` | MySQL hostname (use `db` in Docker) |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | Database username |
| `DB_PASSWORD` | `devops_password` | Database password |
| `DB_NAME` | `ma_devops_db` | Database schema name |

---

## 🚀 Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Run linting (0 errors, 0 warnings)
npm run lint

# 3. Run automated tests (11 tests)
npm test

# 4. Start API server
npm start
```
Server listens on: `http://localhost:8080`

---

## 🐳 Docker Deployment

```bash
# Build standalone image
docker build -t ma-devops-backend .

# Run standalone container as non-root user (UID 1000)
docker run -d -p 8080:8080 --name backend-container ma-devops-backend
```
