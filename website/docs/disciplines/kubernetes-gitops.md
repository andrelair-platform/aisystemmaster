---
id: kubernetes-gitops
title: "Kubernetes & GitOps"
sidebar_position: 8
---

## GitOps Principles

GitOps is an operating model where the **desired state of all infrastructure and applications is declared in Git** and an automated agent continuously reconciles the actual state to match.

The four principles:

1. **Declarative** — everything is described as desired state (YAML manifests), not imperative scripts
2. **Versioned and immutable** — Git is the single source of truth; every change has a commit hash
3. **Pulled automatically** — the cluster pulls from Git (ArgoCD), not CI pushes to the cluster
4. **Continuously reconciled** — if someone manually changes a resource in the cluster, the reconciler reverts it

**Why this matters for AI systems:** prompt versions, model image tags, feature flags, and infra config all live in Git. Rollback = `git revert`. Audit trail = `git log`. Drift = ArgoCD alert.

---

## Repository Structure

Two separate repos (standard GitOps pattern):

```
app-repo/           ← application code, Dockerfile, CI pipeline
  src/
  Dockerfile
  .github/workflows/ci.yml

gitops-repo/        ← Kubernetes manifests, no application code
  base/             ← shared manifests
    deployment.yaml
    service.yaml
    configmap.yaml
  overlays/
    dev/            ← dev-specific patches (low replica count, debug flags)
      kustomization.yaml
      patch-replicas.yaml
    staging/        ← staging patches
      kustomization.yaml
      patch-image.yaml
    production/     ← production patches
      kustomization.yaml
      patch-replicas.yaml
      patch-resources.yaml
```

CI pipeline updates the image tag in `overlays/staging/patch-image.yaml`. ArgoCD detects the commit and syncs. Promotion to production = a PR from `staging` overlay into `production` overlay.

---

## Kustomize (Preferred Over Helm for These Projects)

Kustomize applies patches over a base — no templating language, pure YAML overlays.

```yaml
# base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rag-api
spec:
  replicas: 1
  selector:
    matchLabels: {app: rag-api}
  template:
    metadata:
      labels: {app: rag-api}
    spec:
      containers:
        - name: rag-api
          image: ghcr.io/org/rag-api:latest  # overridden by overlays
          ports: [{containerPort: 8000}]
          env:
            - name: ENVIRONMENT
              value: base
          resources:
            requests: {cpu: "250m", memory: "512Mi"}
            limits: {cpu: "1000m", memory: "2Gi"}
```

```yaml
# overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
patches:
  - path: patch-replicas.yaml
  - path: patch-resources.yaml
images:
  - name: ghcr.io/org/rag-api
    newTag: "abc1234"   # CI updates this line on each deploy
```

```yaml
# overlays/production/patch-replicas.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rag-api
spec:
  replicas: 3  # production gets 3 replicas, base has 1
```

**When to use Helm instead:** when you're deploying a third-party chart (Prometheus, ArgoCD itself, Langfuse). For your own application manifests, Kustomize is simpler and easier to audit.

---

## ArgoCD

ArgoCD is the GitOps reconciliation engine. It watches the GitOps repo and continuously ensures the cluster matches the declared state.

### Installation (for Project 3 k3s cluster)

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### App of Apps pattern

One root ArgoCD Application manages all other Applications:

```yaml
# argocd/root-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/gitops-repo
    targetRevision: main
    path: argocd/apps           # contains one Application manifest per service
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true       # delete resources removed from Git
      selfHeal: true    # revert manual changes in the cluster
```

```yaml
# argocd/apps/rag-api.yaml — one of many child apps
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: rag-api-production
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/gitops-repo
    targetRevision: main
    path: overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: rag-production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
  revisionHistoryLimit: 10    # keep last 10 synced states for rollback
```

### Sync policies

| Policy | When to use |
|---|---|
| `automated` (prune + selfHeal) | Production — changes go through Git, cluster always matches |
| `automated` (no prune) | Staging — allow manual experiments but don't delete on Git change |
| Manual sync | Databases, stateful sets — human approves each sync |

### Rollback

```bash
# List previous synced revisions
argocd app history rag-api-production

# Roll back to a specific revision
argocd app rollback rag-api-production <revision-id>

# Or: revert the GitOps commit (preferred — keeps Git as truth)
git revert <bad-commit-sha>
git push
# ArgoCD auto-syncs to the reverted state
```

### Health checks and sync hooks

ArgoCD uses Kubernetes resource health to determine if a sync succeeded. For AI systems, add a custom health check that also verifies the LLM connection:

```yaml
# In ArgoCD ConfigMap, add custom health check
resource.customizations.health.apps_Deployment: |
  hs = {}
  if obj.status ~= nil then
    if obj.status.readyReplicas == obj.status.replicas then
      hs.status = "Healthy"
      return hs
    end
  end
  hs.status = "Progressing"
  return hs
```

---

## Kubernetes Resources for AI Systems

### Deployment with resource limits (always set both requests and limits)

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "1Gi"
  limits:
    cpu: "2000m"
    memory: "4Gi"
```

Under-resourced pods cause OOM kills and CPU throttling — common source of latency spikes in AI systems.

### GPU scheduling (Project 3 — self-hosted inference)

```yaml
# vLLM inference server deployment
spec:
  template:
    spec:
      nodeSelector:
        nvidia.com/gpu: "true"   # schedule only on GPU nodes
      containers:
        - name: vllm
          image: vllm/vllm-openai:latest
          resources:
            limits:
              nvidia.com/gpu: "2"    # request 2 GPUs
          env:
            - name: CUDA_VISIBLE_DEVICES
              value: "0,1"
```

Requires NVIDIA device plugin installed on the cluster:
```bash
kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/main/deployments/static/nvidia-device-plugin.yml
```

### ConfigMaps for prompt config (non-secret)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prompt-config
data:
  rag-answer-version: "1.2.0"
  rag-answer-prompt: |
    You are a helpful assistant. Answer the user's question using only the
    provided context. If the context doesn't contain the answer, say so.
    Always cite your sources.
```

Mounted into the pod as environment variables or a volume. Changing a prompt = update ConfigMap + ArgoCD syncs (no image rebuild).

### Secrets management

**Never commit secrets to GitOps repo.** Two patterns:

**Pattern A — External Secrets Operator (recommended for Projects 1 & 2):**
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: llm-api-keys
spec:
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: llm-api-keys   # creates a Kubernetes Secret with this name
  data:
    - secretKey: OPENAI_API_KEY
      remoteRef:
        key: rag-api/prod
        property: openai_api_key
```

**Pattern B — Vault Agent Injector (Project 3, on-prem):**
```yaml
# Annotation on the pod triggers Vault Agent sidecar injection
annotations:
  vault.hashicorp.com/agent-inject: "true"
  vault.hashicorp.com/role: "rag-api"
  vault.hashicorp.com/agent-inject-secret-llm-keys: "secret/rag-api/prod"
  vault.hashicorp.com/agent-inject-template-llm-keys: |
    {{- with secret "secret/rag-api/prod" -}}
    export OPENAI_API_KEY="{{ .Data.data.openai_api_key }}"
    {{- end }}
```

### Horizontal Pod Autoscaler

Scale the RAG API based on CPU or custom metrics:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: rag-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: rag-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Pods
      pods:
        metric:
          name: rag_requests_per_second   # custom metric from Prometheus
        target:
          type: AverageValue
          averageValue: "10"
```

For the vLLM inference server: don't use HPA — scale by adding GPU nodes (node autoscaling), not pod replicas. Multiple vLLM pods on the same GPU causes contention.

### Network Policies (tenant isolation)

```yaml
# Only rag-api pods can talk to the vector DB
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: vector-db-isolation
  namespace: rag-production
spec:
  podSelector:
    matchLabels: {app: vector-db}
  ingress:
    - from:
        - podSelector:
            matchLabels: {app: rag-api}
      ports:
        - port: 6333  # Qdrant port
  policyTypes: [Ingress]
```

---

## Applying to All Three Projects

### Project 1 & 2 — Managed Cloud (EKS / AKS / GKE)

Use managed Kubernetes. You don't manage the control plane.

```
CI → push image to GHCR
  ↓
CI → update image tag in GitOps repo
  ↓
ArgoCD (running in the managed cluster) → syncs deployment
  ↓
Rolling update → new pods start, old pods terminate after readiness check
```

Ingress: cloud load balancer (AWS ALB / Azure Application Gateway) + Kubernetes Ingress resource.

Storage: managed PVC for the vector DB (EBS, Azure Disk).

### Project 3 — k3s On-Premises (Sovereign)

k3s is a lightweight Kubernetes distribution — same API, smaller footprint, runs on 3 nodes (1 server + 2 agents):

```bash
# On server node
curl -sfL https://get.k3s.io | sh -

# On agent nodes
curl -sfL https://get.k3s.io | K3S_URL=https://server-ip:6443 K3S_TOKEN=<token> sh -
```

| Component | k3s equivalent of cloud |
|---|---|
| Load balancer | MetalLB (assigns real IPs to LoadBalancer services on bare metal) |
| Storage | Longhorn (distributed block storage across nodes) |
| Ingress | k3s built-in Traefik, or NGINX Ingress |
| Registry | Harbor (self-hosted, with Trivy scanning) |
| DNS | CoreDNS (included in k3s) |

```yaml
# MetalLB IP pool for on-prem
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: production-pool
  namespace: metallb-system
spec:
  addresses:
    - 192.168.10.100-192.168.10.200  # your LAN range
```

---

## RBAC — Least Privilege for AI Services

```yaml
# Service account for rag-api — only what it needs
apiVersion: v1
kind: ServiceAccount
metadata:
  name: rag-api
  namespace: rag-production
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: rag-api-role
  namespace: rag-production
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    resourceNames: ["prompt-config"]
    verbs: ["get", "watch"]
  # rag-api cannot create/delete pods, access secrets directly, etc.
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: rag-api-binding
  namespace: rag-production
subjects:
  - kind: ServiceAccount
    name: rag-api
roleRef:
  kind: Role
  name: rag-api-role
  apiGroup: rbac.authorization.k8s.io
```

---

## Observability Stack on Kubernetes

Deploy as ArgoCD-managed apps:

```yaml
# Monitoring stack (kube-prometheus-stack Helm chart)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: monitoring
spec:
  source:
    repoURL: https://prometheus-community.github.io/helm-charts
    chart: kube-prometheus-stack
    targetRevision: "55.x"
    helm:
      values: |
        grafana:
          enabled: true
          adminPassword: <from-vault>
        prometheus:
          retention: 30d
```

Custom dashboards for AI metrics (deploy as ConfigMaps with `grafana_dashboard: "1"` label):
- Cost per query over time
- Groundedness rate (from Langfuse → Prometheus exporter)
- GPU utilization (NVIDIA DCGM exporter)
- vLLM throughput and queue depth

---

## Rolling Updates and Rollbacks

### Rolling update (default Kubernetes behavior)

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # create 1 extra pod during update
      maxUnavailable: 0  # never take a pod down before a new one is ready
```

New pods must pass the readiness probe before old pods are terminated:

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 3
```

If the new pods fail readiness, the rollout halts automatically — production stays on the old version.

### Rollback

```bash
# Via kubectl (uses Kubernetes revision history)
kubectl rollout undo deployment/rag-api -n rag-production

# Via ArgoCD (preferred — reverts GitOps state)
argocd app rollback rag-api-production <revision>

# Via GitOps (cleanest — creates a revert commit)
git revert <bad-commit>
git push  # ArgoCD syncs automatically
```

**Prefer the GitOps rollback** — it's the only one that keeps Git as the source of truth and creates an audit trail of the incident response.

---

## Drift Detection

ArgoCD continuously compares cluster state to Git. Alert on drift:

```yaml
# Prometheus alert on ArgoCD app out-of-sync
- alert: ArgocdAppOutOfSync
  expr: argocd_app_info{sync_status="OutOfSync"} == 1
  for: 5m
  annotations:
    summary: "ArgoCD app {{ $labels.name }} is out of sync"
    description: "The cluster state no longer matches Git. Manual change detected or sync failed."
```

Out-of-sync in production = someone changed something directly in the cluster (bypassing GitOps). This is a security event in regulated environments (Project 3) — log it and investigate.
