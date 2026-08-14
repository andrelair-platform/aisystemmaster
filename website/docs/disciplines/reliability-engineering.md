---
id: reliability-engineering
title: "Reliability Engineering"
sidebar_position: 10
---


## Scope

This covers the operational concerns that determine whether a system stays up, recovers when it fails, and meets its contractual commitments: high availability, disaster recovery, backup, SLO/SLA management, and incident response at the enterprise level.

These concerns apply to all three projects but are most critical for Project 3 (regulated industry, where downtime has legal and compliance consequences).

---

## High Availability

### HA principle: eliminate single points of failure

Every component that sits in the request path must have at least N+1 redundancy. A single pod, a single database instance, a single AZ — any of these is a hidden SLA violation waiting to happen.

### Application tier HA

```yaml
# Minimum for production: 3 replicas across zones
spec:
  replicas: 3
  template:
    spec:
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels: {app: rag-api}
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchLabels: {app: rag-api}
              topologyKey: kubernetes.io/hostname
              # No two rag-api pods on the same node
```

Pod Disruption Budget — ensure at least 2 pods remain up during node drains:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: rag-api-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels: {app: rag-api}
```

### Database HA

| Database | HA pattern |
|---|---|
| PostgreSQL (metadata, audit) | Patroni (Raft consensus) or managed (RDS Multi-AZ, Azure DB for PostgreSQL HA) |
| Qdrant (vector DB) | Qdrant cluster mode: 3 nodes, replication factor 2, shard count ≥ 6 |
| Redis (semantic cache, session) | Redis Sentinel (3 nodes) or Redis Cluster |
| Keycloak | Active-active cluster backed by PostgreSQL HA |

For Project 3 (on-prem k3s): use Patroni for PostgreSQL and Qdrant cluster mode. No managed services available.

### Inference server HA (Project 3 — vLLM)

vLLM with tensor parallelism is stateless (except KV cache, which is ephemeral). Run 2 replicas minimum:

```yaml
spec:
  replicas: 2
  # But: each pod needs exclusive access to its GPUs
  # Use node affinity + anti-affinity to spread across GPU nodes
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchLabels: {app: vllm}
          topologyKey: kubernetes.io/hostname
```

If one GPU node goes down, the other replica continues serving. Latency degrades but availability is maintained.

### Health checks and circuit breakers

Every service exposes health endpoints:

```python
@router.get("/health/live")    # Kubernetes liveness probe
async def liveness():
    return {"status": "alive"}

@router.get("/health/ready")   # Kubernetes readiness probe
async def readiness():
    # Check all critical dependencies
    checks = {
        "vector_db": await check_vector_db(),
        "llm": await check_llm_connection(),
        "cache": await check_cache(),
    }
    healthy = all(checks.values())
    return JSONResponse(
        status_code=200 if healthy else 503,
        content={"status": "ready" if healthy else "degraded", "checks": checks}
    )
```

Circuit breaker pattern for LLM calls (prevent cascade failure):

```python
from circuitbreaker import circuit

@circuit(failure_threshold=5, recovery_timeout=30, expected_exception=LLMError)
async def call_llm(prompt: str) -> str:
    return await llm_client.complete(prompt)

# If 5 failures in a row: circuit opens for 30s
# During open state: calls fail fast without hitting the LLM
# After 30s: circuit half-opens, one trial call, closes on success
```

### Graceful degradation

When a component fails, degrade gracefully rather than returning an error:

| Component failure | Degraded behavior |
|---|---|
| LLM API (frontier) | Fall back to SLM, or return cached response, or queue for retry |
| Reranker | Skip reranking, return top-N from vector DB directly |
| Semantic cache | Skip cache, always call LLM |
| Vector DB | Return error with explanation — don't hallucinate |
| Single replica | Route to remaining replicas |

Implement with feature flags so you can force degraded mode for testing.

---

## Backup

### Backup scope and RPO targets

| Data | RPO | Backup method | Frequency |
|---|---|---|---|
| Vector DB (embeddings + chunks) | 24h | Qdrant snapshot → S3/MinIO | Daily |
| PostgreSQL (metadata, audit, users) | 1h | pg_dump continuous WAL archiving | Continuous WAL + daily full |
| Keycloak realm config | 24h | Keycloak realm export → S3 | Daily |
| Vault data | 15 min | Vault integrated storage (Raft) snapshot | Every 15 min |
| Model weights | 7 days (change-driven) | Copy to S3 on each model update | On update |
| GitOps repo | On every push | GitHub/GitLab replication | Continuous |
| Prompt registry | On every version | Stored in PostgreSQL (covered by DB backup) | N/A |
| Application config (Kubernetes manifests) | On every push | GitOps repo | Continuous |

### Backup implementation

```bash
# Daily vector DB snapshot (run as a Kubernetes CronJob)
kubectl create cronjob qdrant-backup \
  --image=curlimages/curl \
  --schedule="0 2 * * *" \
  -- sh -c "
    curl -X POST http://qdrant:6333/collections/rag-docs/snapshots &&
    SNAPSHOT=$(curl http://qdrant:6333/collections/rag-docs/snapshots | jq -r '.result[-1].name') &&
    curl http://qdrant:6333/collections/rag-docs/snapshots/$SNAPSHOT --output /tmp/snapshot.tar &&
    mc cp /tmp/snapshot.tar minio/backups/qdrant/$(date +%Y%m%d).tar
  "
```

```yaml
# PostgreSQL continuous WAL archiving (in Patroni config)
postgresql:
  parameters:
    archive_mode: on
    archive_command: "mc cp %p minio/backups/postgres/wal/%f"
    wal_level: replica
```

### Backup encryption

All backups encrypted at rest and in transit:

```bash
# Encrypt before upload
gpg --symmetric --cipher-algo AES256 --output backup.tar.gpg backup.tar
mc cp backup.tar.gpg minio/backups/encrypted/

# Encryption key stored in Vault, not on backup server
```

### Backup testing

A backup that has never been restored is not a backup — it is a liability.

| Test | Frequency | Procedure |
|---|---|---|
| Restore drill — single collection | Monthly | Restore Qdrant snapshot to staging, verify query results match |
| Restore drill — full PostgreSQL | Quarterly | Restore to isolated instance, verify row counts and data integrity |
| Restore drill — full DR (see below) | Annually | Full DR failover to secondary site |

Log every backup and every restore test result. Regulators will ask for this log.

---

## Disaster Recovery

### RTO targets by system tier

| Tier | Systems | RTO target |
|---|---|---|
| Tier 1 — Critical | RAG query API, authentication (Keycloak) | < 1 hour |
| Tier 2 — Important | Workflow automation, audit log ingestion | < 4 hours |
| Tier 3 — Standard | Admin UI, reporting, corpus re-indexing | < 24 hours |

### DR architecture

For Projects 1 & 2 (managed cloud): multi-region active-passive.

```
Primary region (eu-west-1)          Secondary region (eu-central-1)
  rag-api (active)                    rag-api (warm standby, 1 replica)
  qdrant-primary                      qdrant-replica (async replication)
  postgres-primary                    postgres-standby (streaming replication)
  ←── failover in < 30 min via Route53/Traffic Manager DNS failover ───→
```

For Project 3 (on-prem k3s): secondary site (separate physical location) with async replication:

```
Primary site (datacenter A)         Secondary site (datacenter B)
  k3s cluster (3 nodes)               k3s cluster (3 nodes, warm)
  Longhorn volumes                    Longhorn volumes (replicated)
  Qdrant primary                      Qdrant replica
  PostgreSQL primary                  PostgreSQL standby (Patroni replica)
  ←── manual failover, RTO < 4h ───→
```

### DR runbook — full failover (Project 3)

This is the playbook executed when the primary site becomes unavailable.

```markdown
## DR Failover Runbook — Primary Site Loss

### Trigger criteria
- Primary site unreachable for > 15 minutes
- Confirmed by infrastructure monitoring (not just one person's observation)

### Step 1 — Declare DR (5 min)
- [ ] Incident commander declared
- [ ] DR team assembled (min: infra lead + security lead)
- [ ] Stakeholders notified (management, compliance officer)
- [ ] Incident ticket opened with timestamp

### Step 2 — Verify secondary site health (10 min)
- [ ] `kubectl get nodes` on secondary cluster — all nodes Ready
- [ ] Qdrant secondary: `curl http://qdrant-secondary:6333/collections` — collections present
- [ ] PostgreSQL standby: `SELECT pg_is_in_recovery()` — returns true (it's a replica)
- [ ] Last replication lag: `SELECT now() - pg_last_xact_replay_timestamp()` — accept if < 1h

### Step 3 — Promote secondary databases (15 min)
- [ ] PostgreSQL: `patronictl -c /etc/patroni.yml failover rag-cluster --master pg-secondary --force`
  - Verify: `SELECT pg_is_in_recovery()` → false (now primary)
- [ ] Qdrant: point application config to secondary endpoint
  - `kubectl set env deployment/rag-api QDRANT_URL=http://qdrant-secondary:6333`

### Step 4 — Activate secondary applications (15 min)
- [ ] Scale up rag-api on secondary: `kubectl scale deployment rag-api --replicas=3 -n rag-production`
- [ ] Scale up vllm: `kubectl scale deployment vllm --replicas=2 -n rag-production`
- [ ] Verify readiness: `kubectl rollout status deployment/rag-api`
- [ ] Health check: `curl https://rag-secondary.internal/health/ready`

### Step 5 — Redirect traffic (5 min)
- [ ] Update DNS / load balancer to point to secondary site
- [ ] Verify end-to-end: run 5 test queries, check responses

### Step 6 — Notify stakeholders
- [ ] Confirm system is serving traffic from secondary
- [ ] Communicate estimated primary restoration timeline
- [ ] Log RTO achieved: [time from Step 1 to Step 5 completion]

### Post-DR
- [ ] Document actual data loss (RPO achieved vs target)
- [ ] Root cause investigation of primary site failure
- [ ] Schedule failback once primary is restored and verified
- [ ] Update this runbook based on what went wrong
```

### Failback procedure

Once primary site is restored:
1. Re-sync databases from secondary to primary (PostgreSQL streaming replication catch-up)
2. Verify data integrity on primary
3. Schedule a maintenance window
4. Redirect traffic back to primary
5. Demote secondary back to replica role
6. Document total downtime and data loss in the incident report

---

## SLO / SLA

### SLO definitions (internal commitments)

SLOs are your internal targets. SLAs are contractual commitments to customers (a subset of SLOs, with consequences for breach).

| SLO | Metric | Target | Measurement window |
|---|---|---|---|
| Availability | `(successful_requests / total_requests) × 100` | 99.5% | Rolling 30 days |
| p95 query latency | 95th percentile end-to-end latency | < 3,000ms | Rolling 24h |
| Groundedness | Groundedness judge score | > 95% | Rolling 7 days |
| Refusal rate on out-of-scope | % of adversarial queries correctly refused | > 90% | Rolling 7 days |
| Data loss | Events where committed data was lost | 0 per month | Monthly |
| Recovery time | Time from incident declaration to resolution | < 4h (Tier 1) | Per incident |

### Error budget

Error budget = `(1 - SLO_target) × measurement_window_minutes`

For 99.5% availability over 30 days:
- Budget = `0.005 × 30 × 24 × 60 = 216 minutes`
- If 216 minutes of downtime is consumed: freeze all non-reliability work until the next 30-day window

Track error budget burn rate in Grafana. Alert when:
- Burn rate > 5× expected (fast burn alert — incident in progress)
- Burn rate > 2× expected (slow burn alert — trend toward SLO breach)

### Prometheus SLO recording rules

```yaml
# Record availability SLO (Prometheus)
groups:
  - name: slo-rag-api
    rules:
      - record: slo:rag_api:availability:ratio_rate5m
        expr: |
          sum(rate(http_requests_total{job="rag-api",status!~"5.."}[5m]))
          /
          sum(rate(http_requests_total{job="rag-api"}[5m]))

      - alert: RagApiAvailabilityBurnFast
        expr: |
          (
            slo:rag_api:availability:ratio_rate5m < 0.995
          ) and (
            slo:rag_api:availability:ratio_rate5m < 0.970
          )
        for: 2m
        annotations:
          summary: "RAG API fast error budget burn — SLO at risk"

      - alert: RagApiP95LatencyBreach
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_ms_bucket{job="rag-api"}[5m])) > 3000
        for: 5m
        annotations:
          summary: "RAG API p95 latency exceeds 3000ms SLO"
```

### SLA contracts with clients (Stage 3+)

When selling to regulated-industry clients, the SLA section of the contract covers:

```markdown
## Service Level Agreement

### Availability
Provider guarantees 99.5% monthly uptime for the Production environment.
Scheduled maintenance (< 2h/month, with 5 business days' notice) is excluded.
Downtime caused by client infrastructure is excluded.

### Incident response times
| Severity | Definition | Initial response | Status update |
|----------|------------|-----------------|---------------|
| P1 — Critical | System unavailable | 15 min | Every 30 min |
| P2 — High | Core feature degraded | 1 hour | Every 2 hours |
| P3 — Medium | Non-core feature affected | 4 hours | Daily |
| P4 — Low | Minor issue, workaround exists | 2 business days | Weekly |

### Data recovery
Provider guarantees RPO ≤ 1 hour and RTO ≤ 4 hours for Tier 1 systems.

### Financial remedies (service credits)
| Monthly uptime | Credit |
|----------------|--------|
| 99.0–99.5% | 10% of monthly fee |
| 95.0–99.0% | 25% of monthly fee |
| < 95.0% | 50% of monthly fee |

Credits are the sole remedy for SLA breach unless otherwise agreed.
```

---

## Incident Management

### Severity classification

| Severity | Criteria | Examples |
|---|---|---|
| **P1 — Critical** | System unavailable or data breach | Complete outage, prompt injection producing harmful output in production, mass data leak |
| **P2 — High** | Core feature severely degraded, >25% error rate | High hallucination rate, retrieval returning wrong-tenant data, auth failures for >10% of users |
| **P3 — Medium** | Non-core feature affected, workaround available | Slow latency on non-critical queries, semantic cache down, one MCP server unavailable |
| **P4 — Low** | Minor issue, no user impact | Log format change, metric gap, cosmetic UI bug |

### Incident lifecycle

```
Detection (monitoring alert or user report)
  ↓
Triage (assign severity, declare incident commander)
  ↓
Communication (notify stakeholders, open incident channel)
  ↓
Investigation (identify root cause)
  ↓
Mitigation (stop the bleeding — not necessarily root cause fix)
  ↓
Resolution (permanent fix or accepted workaround)
  ↓
Post-mortem (within 5 business days of resolution)
  ↓
Action items (tracked in project management, assigned, time-bound)
```

### Incident commander responsibilities

The IC has decision authority during the incident:
- Declares severity
- Assembles the response team
- Owns communication to stakeholders (one voice, not a dozen)
- Makes the call on risky mitigations (kill-switch, rollback, failover)
- Calls the all-clear when resolved
- Does not debug — that's the technical responder's job

### On-call rotation

Tooling: PagerDuty, Opsgenie, or self-hosted (Grafana OnCall).

```yaml
# On-call schedule
schedule:
  - name: "Primary on-call"
    rotation_type: weekly
    participants: [alice, bob, carol, dave]
    restrictions:
      - type: time_of_day
        start_day: Mon, start_time: 09:00
        end_day: Fri, end_time: 18:00  # business hours: 5-min response
      # Outside hours: 30-min response (phone call)

escalation:
  - level: 1
    targets: [primary-on-call]
    notify_after: 5 minutes
  - level: 2
    targets: [engineering-lead]
    notify_after: 15 minutes
  - level: 3
    targets: [cto]
    notify_after: 30 minutes  # P1 only
```

### Runbook library

Every alert has a runbook. Runbooks live in the GitOps repo at `runbooks/`. They are reviewed quarterly and updated after every incident that exposed a gap.

```markdown
## Runbook: RagApiP95LatencyBreach

### When this fires
p95 request latency > 3000ms for > 5 minutes.

### Immediate checks (first 5 minutes)
1. `kubectl top pods -n rag-production` — is any pod CPU/memory saturated?
2. Grafana → RAG API dashboard → "LLM call latency" panel — is the LLM slow?
3. Grafana → RAG API dashboard → "Vector DB latency" panel — is Qdrant slow?
4. Grafana → RAG API dashboard → "Replica count" — are all replicas healthy?

### Common causes and fixes
| Cause | Fix |
|-------|-----|
| LLM API slow (frontier provider) | Switch to SLM via feature flag: `feature_flags set generator_model=slm` |
| Qdrant slow (high shard load) | Check shard distribution: `curl qdrant:6333/cluster` |
| All replicas on one node (after node failure) | Delete pods to trigger rescheduling |
| Semantic cache miss rate spiked | Check Redis: `redis-cli info stats` — if Redis down, disable semantic cache |

### Escalate if
- Latency > 10s p95 sustained for > 10 minutes → P1
- Fix not found in 30 minutes → escalate to engineering lead
```

### Post-mortem template

```markdown
## Post-Mortem: [Incident title]

**Date:** YYYY-MM-DD
**Duration:** HH:MM (detection) → HH:MM (resolution) = X hours Y minutes
**Severity:** P[1-4]
**Impact:** [N users affected | N queries failed | SLO impact: X minutes of error budget consumed]
**Incident commander:** [name]

## Summary
[2–3 sentences: what happened, what broke, what was done to fix it]

## Timeline
| Time | Event |
|------|-------|
| HH:MM | Alert fired / user report received |
| HH:MM | Incident declared, IC assigned |
| HH:MM | Root cause identified |
| HH:MM | Mitigation applied |
| HH:MM | Resolution confirmed |

## Root cause
[One paragraph. Be precise — "high load" is not a root cause. "The vLLM KV cache eviction policy under sustained concurrent load caused queue depth to exceed 100, increasing p99 latency to 12s" is.]

## Root cause category
[ ] Prompt  [ ] Retrieval  [ ] Model  [ ] Tool/agent  [ ] Data/corpus  [ ] Infra  [ ] External dependency  [ ] Process

## Contributing factors
[List. These are the conditions that allowed the root cause to have impact.]

## What went well
[List. Honest — even bad incidents have things that worked.]

## What went wrong
[List. No blame — process and system failures, not person failures.]

## Action items
| Action | Owner | Due date | Status |
|--------|-------|----------|--------|
| [Add metric that would have detected this earlier] | @dev | YYYY-MM-DD | Open |
| [Add test case to adversarial eval set] | @dev | YYYY-MM-DD | Open |
| [Update runbook with fix procedure] | @ic | YYYY-MM-DD | Open |

## Eval set update
[Mandatory: describe the test case added to the adversarial or regression suite as a result of this incident.]
```

---

## Infrastructure Redundancy Checklist

Run this checklist before any production launch:

```markdown
### Compute
- [ ] Application: ≥ 3 replicas across ≥ 2 availability zones / nodes
- [ ] PodDisruptionBudget configured (minAvailable ≥ 2)
- [ ] Node anti-affinity configured
- [ ] HPA configured with appropriate min/max replicas

### Databases
- [ ] PostgreSQL: primary + at least 1 replica (or managed HA)
- [ ] Qdrant: cluster mode with replication factor ≥ 2
- [ ] Redis: Sentinel or Cluster mode (not single instance)
- [ ] Keycloak: active-active with shared PostgreSQL backend

### Networking
- [ ] Load balancer HA (managed LB or MetalLB with multiple IPs)
- [ ] DNS TTL ≤ 60s (fast failover)
- [ ] Ingress controller ≥ 2 replicas

### Storage
- [ ] PVCs backed by replicated storage (Longhorn replication factor ≥ 2, or managed)
- [ ] Backup configured and tested within last 30 days
- [ ] Backup stored in separate location (not same disk or AZ as primary)

### Monitoring
- [ ] Alert for every SLO defined above
- [ ] Alert routing to on-call (PagerDuty/Opsgenie configured)
- [ ] Runbook linked from every alert
- [ ] Monitoring stack itself is HA (Prometheus HA with Thanos or Victoria Metrics)

### DR
- [ ] DR runbook written and reviewed
- [ ] Secondary site provisioned and warm
- [ ] Failover tested within last 6 months
- [ ] RTO and RPO validated against targets
```
