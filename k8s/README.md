# Kubernetes Production Architecture & Cluster Runbook

This directory implements **Part 8 (Cloud Production Architecture)** and **Part 10 (Deployment Strategy)** of the MA Soft Tech Solutions DevOps Internship Assessment.

---

## Production Architecture Overview

The system is deployed into a dedicated, isolated namespace (`ma-devops`) following enterprise Kubernetes standards:

```
                                  [ Ingress Controller (Nginx) ]
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       │                                                 │
                 (Path: /)                                          (Path: /api)
                       │                                                 │
                       ▼                                                 ▼
          [ ma-devops-frontend-svc ]                         [ ma-devops-backend-svc ]
                 (Port: 80)                                         (Port: 8080)
                       │                                                 │
          [ Frontend Pods (Replicas: 2) ]                   [ Backend Pods (Replicas: 2..6) ]
           • Image: rayyan12311/fe:v1.0.0                    • Image: rayyan12311/be:v1.0.0
           • Non-root UID: 101 (nginx)                       • Non-root UID: 1000 (node)
           • Probes: HTTP / :8080                            • Probes: HTTP /health :8080
                                                             • Autoscaler: HPA (CPU @ 70%)
                                                                         │
                                                                   (Port: 3306)
                                                                         │
                                                                         ▼
                                                             [ ma-devops-mysql-svc ]
                                                                         │
                                                              [ MySQL Pod (Replicas: 1) ]
                                                               • Image: mysql:8.0
                                                               • Storage: PVC 1Gi
                                                               • Init: ConfigMap (Schema & Seed)
```

---

## Architectural Requirements Addressed (Part 8 Checklist)

| Assessment Criterion | Implementation in Manifests | File Reference |
|---|---|---|
| **Networking & Access** | Ingress controller routing `/` to Frontend and `/api` to Backend with path rewriting. | [`ingress.yaml`](./ingress.yaml) |
| **Internal Communication** | Decoupled CoreDNS Service discovery (`ma-devops-mysql-svc:3306`, `ma-devops-backend-svc:8080`). | [`backend-service.yaml`](./backend-service.yaml), [`mysql-service.yaml`](./mysql-service.yaml) |
| **Security & Least Privilege** | Strict non-root execution: Backend runs as UID 1000 (`node`), Frontend runs as UID 101 (`nginx`). | [`backend-deployment.yaml`](./backend-deployment.yaml), [`frontend-deployment.yaml`](./frontend-deployment.yaml) |
| **Configuration & Secrets** | Separation of non-sensitive configs (ConfigMap) and sensitive credentials (Secret). | [`configmap.yaml`](./configmap.yaml), [`secret.yaml`](./secret.yaml) |
| **Automated Data Seeding** | Mounts `01_schema.sql` and `02_seed.sql` into `/docker-entrypoint-initdb.d/` on first startup. | [`mysql-init-configmap.yaml`](./mysql-init-configmap.yaml) |
| **Health Checks & Liveness** | Probing `/health` on port 8080 before routing traffic to prevent routing to degraded pods. | [`backend-deployment.yaml`](./backend-deployment.yaml) |
| **Zero-Downtime Rollouts** | RollingUpdate strategy configured with `maxSurge: 1` and `maxUnavailable: 0`. | [`backend-deployment.yaml`](./backend-deployment.yaml) |
| **Resource Management** | Strict CPU/Memory requests and limits preventing noisy-neighbor starvation. | All Deployment manifests |
| **Horizontal Autoscaling** | HPA dynamically scales backend pods between 2 and 6 replicas at 70% CPU threshold. | [`hpa.yaml`](./hpa.yaml) |

---

## Step-by-Step Operator Runbook

### 1. Deploy the Complete Stack
```bash
# Apply namespace first
kubectl apply -f k8s/namespace.yaml

# Apply configurations and storage
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mysql-init-configmap.yaml
kubectl apply -f k8s/mysql-pvc.yaml

# Deploy database tier
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/mysql-service.yaml

# Deploy application tiers
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Apply Ingress and Autoscaler
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

*Or apply all at once:*
```bash
kubectl apply -f k8s/
```

---

### 2. Verify Cluster Health & Pod Status
```bash
# Check all resources in the namespace
kubectl get all -n ma-devops

# Verify non-root execution inside pods
kubectl exec -n ma-devops deploy/ma-devops-backend -c backend -- id
# Expected: uid=1000(node) gid=1000(node)

kubectl exec -n ma-devops deploy/ma-devops-frontend -c frontend -- id
# Expected: uid=101(nginx) gid=101(nginx)

# Verify automated database seeding
kubectl exec -n ma-devops deploy/ma-devops-mysql -c mysql -- \
  mysql -u root -pdevops_password -e "SELECT * FROM ma_devops_db.items;"
```

---

### 3. Port-Forward for Local Access
```bash
# Expose frontend to localhost:3000
kubectl port-forward svc/ma-devops-frontend-svc 3000:80 -n ma-devops

# Expose backend API to localhost:8080
kubectl port-forward svc/ma-devops-backend-svc 8080:8080 -n ma-devops
```

---

### 4. Zero-Downtime Rollout & Instant Rollback Verification
```bash
# Update backend image to trigger rolling update
kubectl set image deployment/ma-devops-backend backend=rayyan12311/ma-devops-backend:latest -n ma-devops

# Watch the zero-downtime rollout progression
kubectl rollout status deployment/ma-devops-backend -n ma-devops

# Inspect rollout revision history
kubectl rollout history deployment/ma-devops-backend -n ma-devops

# Execute an instant emergency rollback
kubectl rollout undo deployment/ma-devops-backend -n ma-devops
```

---

### 5. Advanced Deployment Strategies (Blue-Green & Canary)
For Blue-Green and Canary specifications and verification steps, see [`strategies/README.md`](./strategies/README.md).
