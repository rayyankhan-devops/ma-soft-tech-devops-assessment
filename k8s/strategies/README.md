# Production Deployment Strategies Evaluation

This document fulfills **Part 10 (Deployment Strategy)** of the MA Soft Tech Solutions DevOps Internship Assessment, analyzing and comparing production release patterns for containerized microservice architectures.

---

## Strategy Comparison Matrix

| Strategy | When to Use | Advantages | Disadvantages | Rollback Process | Downtime | Resource Cost |
|---|---|---|---|---|---|---|
| **Rolling Deployment** | Routine feature releases and bug fixes with backward-compatible schemas. | • Zero downtime<br>• No duplicate infrastructure required<br>• Native Kubernetes support (`maxSurge`, `maxUnavailable`) | • Both old and new versions run concurrently during rollout<br>• Incompatible schema migrations can cause transient errors | Instant revision rollback via `kubectl rollout undo deployment/<name>` | **0 sec** | **Low** (Only temporary `maxSurge` pods) |
| **Blue-Green Deployment** | High-risk version cutovers, database schema refactors, or critical API updates. | • Instantaneous traffic switch<br>• Fully isolated pre-production validation on green environment<br>• Clean isolation of versions | • Requires 2x compute capacity during deployment<br>• Stateful data synchronization complexity | Instant pointer reversion via Service selector switch (`version: green` → `blue`) | **0 sec** | **High** (200% cluster compute during cutover) |
| **Canary Deployment** | High-volume production traffic testing, performance profiling, and error-budget protection. | • Risk minimization (only 5–10% of users exposed initially)<br>• Real user metrics and error rates validate release | • Complex traffic routing (requires Ingress controller or Service Mesh)<br>• Version coexistence challenges | Remove canary Ingress rule or scale canary deployment to 0 replicas | **0 sec** | **Medium** (Small increment of pods) |

---

## Technical Deep-Dive

### 1. Rolling Deployment (Default Kubernetes Pattern)
* **Mechanism:** Incrementally replaces v1 pods with v2 pods according to the configured `rollingUpdate` parameters.
* **Production Spec:**
  ```yaml
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Allows 1 extra pod during rollout
      maxUnavailable: 0  # Guarantees no capacity drops
  ```
* **Rollback:** `kubectl rollout undo deployment/ma-devops-backend -n ma-devops` reverts to the prior ReplicaSet in seconds.

---

### 2. Blue-Green Deployment
* **Mechanism:** An identical "Green" deployment is provisioned alongside the live "Blue" deployment. Automated smoke tests validate Green without impacting real users. Once verified, the Kubernetes Service selector is updated from `version: blue` to `version: green`.
* **Traffic Switch:**
  ```bash
  kubectl patch service ma-devops-backend-live -n ma-devops \
    -p '{"spec":{"selector":{"version":"green"}}}'
  ```
* **Instant Rollback:**
  ```bash
  kubectl patch service ma-devops-backend-live -n ma-devops \
    -p '{"spec":{"selector":{"version":"blue"}}}'
  ```

---

### 3. Canary Deployment
* **Mechanism:** Routes a fraction of production traffic (e.g., 10%) to a single canary pod running the new image, while 90% stays on the stable baseline.
* **Routing Implementation:** Nginx Ingress annotations dynamically split traffic:
  ```yaml
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"
  ```
* **Rollback:** Deleting the canary Ingress immediately restores 100% traffic to stable pods.

---

## Selected Strategy & Justification for MA Soft Tech Solutions

### Selected Strategy: **Rolling Deployment with Automated Probes**

### Justification:
1. **Resource Efficiency:** The application is a lightweight, decoupled Node.js API with a React SPA frontend. Running a full duplicate Blue/Green environment doubles infrastructure compute costs without added necessity.
2. **Native Resilience via Health Probes:** By binding `readinessProbe` and `livenessProbe` to `/health`, Kubernetes will refuse to route traffic to new pods until their MySQL pool connection and Express runtime are verified UP.
3. **Zero Downtime Guarantee:** With `maxUnavailable: 0` and `maxSurge: 1`, the cluster maintains 100% capacity throughout the entire deployment window.
4. **Instant Rollback Capability:** Should an unhandled regression bypass testing, Kubernetes stores revision history allowing instantaneous rollback in a single shell command without re-pulling or rebuilding images.
