# Prometheus & Grafana Production Monitoring

This guide details the integration of the Prometheus and Grafana observability stack with the MA Soft Tech Solutions DevOps assessment project.

---

## 1. Monitoring Architecture

The cluster runs a Kubernetes-native `kube-prometheus-stack` operator in the `monitoring` namespace, scraping metrics across the cluster and application workloads:

```
    [ cAdvisor / Kube-State-Metrics / Node-Exporter ]
                          │
                          ▼ (Prometheus Scrape Interval: 15s)
               [ Prometheus Server (:9090) ]
                          │
                          ▼ (Datasource: Prometheus)
                 [ Grafana Server (:80) ]
                          │
                          ▼ (Watched by grafana-sc-dashboard sidecar)
         [ ConfigMap: ma-devops-grafana-dashboard ]
```

---

## 2. Step-by-Step Operator Instructions

You can manage the monitoring stack using your dedicated helper script located at `/Users/muhammadrayyan/devops/monitoring-stack.sh`.

### Step 1: Start / Scale Up the Monitoring Stack
Ensure all Prometheus, Grafana, and Node Exporter workloads are scaled up and ready:
```bash
bash /Users/muhammadrayyan/devops/monitoring-stack.sh start all
```

### Step 2: Deploy the Project Observability Dashboard
Apply the automated Grafana dashboard ConfigMap (automatically picked up by Grafana's sidecar):
```bash
kubectl apply -f k8s/monitoring/grafana-dashboard-configmap.yaml
```

### Step 3: Start Port-Forwarding
Run the forward command to expose the Grafana and Prometheus web interfaces:
```bash
bash /Users/muhammadrayyan/devops/monitoring-stack.sh forward all
```

### Step 4: Access the Dashboards in Browser
* **Grafana Dashboard:** [`http://localhost:3000`](http://localhost:3000)
  * **Username:** `admin`
  * **Password:** `QaG7KRR2GWrhNYfEzWuF4FPSqe9xio9QlqYvXUB9`
  * **Direct Dashboard URL:** [`http://localhost:3000/d/ma-devops-observability`](http://localhost:3000/d/ma-devops-observability)
* **Prometheus Query UI:** [`http://localhost:9090`](http://localhost:9090)

### Step 5: Suspend / Stop to Save Laptop Resources (When Done)
When you finish testing and taking screenshots, scale down the monitoring stack to 0 replicas to preserve Mac memory and CPU:
```bash
bash /Users/muhammadrayyan/devops/monitoring-stack.sh stop all
```

---

## 3. What the Dashboard Monitors (Assessment Part 8 & 11)

The custom dashboard (`MA Soft Tech Solutions — DevOps Production Observability`) visualizes:
1. **Cluster Health & Workload State**:
   * Running vs degraded pods in `ma-devops` namespace.
   * Container restarts tracker (detects CrashLoopBackOff instantly).
   * MySQL single-pod durability and readiness indicator.
   * Active HPA backend replicas (current capacity vs autoscaling bounds).
2. **CPU Resource Telemetry**:
   * CPU core consumption over time per container (`ma-devops-backend`, `ma-devops-frontend`, `ma-devops-mysql`).
3. **Memory Resource Telemetry**:
   * Working set RAM consumption in MB against defined container limits.
4. **Network Throughput**:
   * Received and transmitted traffic bandwidth (KB/s) across all services.

---

## 4. Production Incident Troubleshooting (Assessment Part 11)

If latency spikes or errors increase after deployment:
1. **Check Dashboard Row 1**: Check if `Backend HPA Active Replicas` is scaling up, or if `Total Pod Restarts` is incrementing.
2. **Inspect CPU / Memory Rows**: Determine if pods are being throttled on CPU or terminated due to OOM (Out Of Memory).
3. **Inspect Prometheus Target Latency**:
   ```promql
   sum(rate(container_cpu_usage_seconds_total{namespace="ma-devops"}[1m])) by (pod)
   ```
