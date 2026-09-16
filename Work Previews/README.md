# MA Soft Tech Solutions — Practical Assessment Evidence

This directory contains verified screenshot evidence validating the implementation of **Part 2 (Full Stack Decoupled Application)**, **Part 3 (Git & Version Control)**, and **Part 5 (Advanced Dockerization)** of the MA Soft Tech Solutions DevOps Internship Assessment.

---

## Evidence Index

| # | Artifact | Assessment Part | Description |
|---|---|---|---|
| **01** | [`01_docker_container_non_root_security.png`](./01_docker_container_non_root_security.png) | **Part 5: Advanced Dockerization** | Verification of unprivileged execution (`uid=101(nginx)` and `uid=1000(node)`). |
| **02** | [`02_mysql_auto_schema_seed_verification.png`](./02_mysql_auto_schema_seed_verification.png) | **Part 2 & Part 5** | Database table auto-creation and 5 pre-seeded DevOps records in MySQL. |
| **03** | [`03_backend_health_telemetry_endpoint.png`](./03_backend_health_telemetry_endpoint.png) | **Part 2: Build Application** | Detailed JSON health telemetry endpoint (`/health`) with live MySQL probe. |
| **04** | [`04_nginx_proxy_and_api_validation_test.png`](./04_nginx_proxy_and_api_validation_test.png) | **Part 2 & Part 5** | Nginx reverse proxy routing and Express schema validation (`HTTP 400 Bad Request`). |
| **05** | [`05_automated_tests_and_eslint_pass.png`](./05_automated_tests_and_eslint_pass.png) | **Part 2: Build Application** | 100% pass across 14 Vitest unit tests and 0 ESLint 9 lint errors. |
| **06** | [`06_git_branching_and_merge_history.png`](./06_git_branching_and_merge_history.png) | **Part 3: Git & Version Control** | Linear commit tree with feature branch isolation and `--no-ff` merge commits. |
| **07** | [`07_react_frontend_web_dashboard.png`](./07_react_frontend_web_dashboard.png) | **Part 2: Build Application** | Live React dashboard showing company branding, real-time health telemetry, and CRUD bench. |

---

## Detailed Evidence Breakdown & Interview Talking Points

### 1. `01_docker_container_non_root_security.png`
* **Evidence Shown:** Running `id` inside active containers reveals `uid=101(nginx)` for the web tier and `uid=1000(node)` for the API tier.
* **Reproduction Command:**
  ```bash
  docker compose exec backend id && docker compose exec frontend id
  ```
* **Interview Explanation:**
  > *"We enforced the principle of least privilege by running the Node API as UID 1000 (`node`) and the Nginx frontend as UID 101 (`nginx`), completely neutralizing container-escape root privilege escalation risks."*

---

### 2. `02_mysql_auto_schema_seed_verification.png`
* **Evidence Shown:** Querying `ma_devops_db.items` displays 5 initial tasks created at container startup.
* **Reproduction Command:**
  ```bash
  docker compose exec db mysql -u root -pdevops_password -e "SELECT * FROM ma_devops_db.items;"
  ```
* **Interview Explanation:**
  > *"We decoupled SQL initialization into `db/init/mysql/` mounted into the MySQL `/docker-entrypoint-initdb.d/` directory, ensuring reproducible, zero-manual-intervention schema migration and seed data population on startup."*

---

### 3. `03_backend_health_telemetry_endpoint.png`
* **Evidence Shown:** `GET /health` returns JSON telemetry with `status: "UP"`, `uptime`, `memoryUsage`, and verified MySQL database connectivity.
* **Reproduction Command:**
  ```bash
  curl -i http://localhost:8080/health
  ```
* **Interview Explanation:**
  > *"Rather than relying on a shallow HTTP ping, our `/health` probe actively pings the MySQL connection pool and reports memory metrics, making it cloud-ready for Kubernetes liveness and readiness monitoring."*

---

### 4. `04_nginx_proxy_and_api_validation_test.png`
* **Evidence Shown:** Nginx forwards requests to `/api/v1/items`. An invalid POST payload (`{"title":""}`) immediately triggers an HTTP 400 with a structured validation error response.
* **Reproduction Command:**
  ```bash
  curl -i http://localhost:3000/api/v1/items
  curl -i -X POST http://localhost:3000/api/v1/items -H "Content-Type: application/json" -d '{"title":""}'
  ```
* **Interview Explanation:**
  > *"The unprivileged Nginx reverse proxy routes client traffic securely to our Node.js microservice, where Express validation middleware enforces schema rules and returns descriptive HTTP 400 errors for bad payloads."*

---

### 5. `05_automated_tests_and_eslint_pass.png`
* **Evidence Shown:** Vitest runs 11 backend API tests and 3 frontend React tests (14 total, all passing) with zero ESLint warnings across both projects.
* **Reproduction Command:**
  ```bash
  cd backend && npm run lint && npm test && cd ../frontend && npm run lint && npm test
  ```
* **Interview Explanation:**
  > *"Both decoupled tiers include isolated ESLint 9 configurations and automated Vitest suites covering CRUD operations, status code handling, validation boundaries, and UI rendering."*

---

### 6. `06_git_branching_and_merge_history.png`
* **Evidence Shown:** `git log --graph --oneline` shows commit lineage with feature branch `feature/advanced-dockerization` merged via `--no-ff` into `main`.
* **Reproduction Command:**
  ```bash
  git log --graph --oneline -n 6 && git branch -a
  ```
* **Interview Explanation:**
  > *"We practiced clean trunk-based branch isolation with descriptive conventional commits and an explicit `--no-ff` merge commit, preserving an auditable deployment history ready for enterprise branch protection rules."*

---

### 7. `07_react_frontend_web_dashboard.png`
* **Evidence Shown:** Live web interface running at `http://localhost:3000` with MA Soft Tech Solutions branding, live system telemetry card, validation tester, and task list.
* **Reproduction URL:**
  `http://localhost:3000`
* **Interview Explanation:**
  > *"The Vite React single-page application displays live backend health telemetry, database mode indicators, and an interactive task dashboard served statically by an unprivileged Nginx reverse proxy."*
