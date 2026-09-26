---
id: compliance-governance
title: "Compliance & Governance"
sidebar_position: 11
---

## Scope

This covers the organizational and legal layer of production AI in regulated industries: DPIA, data retention, legal review, model governance, audit log architecture, change management, and cost controls. These are the concerns that determine whether a regulated buyer signs the contract — and whether they renew it.

---

## DPIA — Data Protection Impact Assessment

### When a DPIA is mandatory (GDPR Article 35)

A DPIA is required before processing that is "likely to result in a high risk" to individuals. For AI systems in regulated industries, this means:

| Scenario | DPIA required? |
|---|---|
| Processing health data, biometric data, or data about criminal convictions | Yes — always |
| Automated decision-making with legal or similarly significant effects | Yes — always |
| Large-scale processing of personal data | Yes — always |
| Systematic monitoring of individuals | Yes |
| Processing of data of vulnerable persons (patients, children) | Yes |
| AI-generated recommendations that affect insurance coverage or claims | Yes |
| Internal RAG over employee data | Likely yes |
| RAG over public regulatory documents only (no personal data) | No |

**For Project 3 (Insurance Copilot):** DPIA is mandatory. Claims processing involves personal data + automated decision support with significant effects on individuals.

### DPIA structure

```markdown
## DPIA — Insurance Compliance Copilot v1.0

### 1. Description of the processing
**Purpose:** AI-assisted analysis of insurance claims and policy coverage to support underwriter decisions.
**Data categories:** policyholder name, address, date of birth, policy details, claim history, medical information (where applicable), financial information.
**Data subjects:** policyholders, claimants.
**Recipients:** underwriters (internal), compliance officers (internal), no external recipients.
**Retention:** [see Data Retention section].
**Transfers:** no cross-border transfers. Data stays within EU. [If using a Frontier API: DPA with vendor required; specify data processing location.]

### 2. Necessity and proportionality
**Purpose limitation:** data used only for claim analysis and policy coverage determination.
**Data minimisation:** only the fields required for the specific claim or query are retrieved. The full policyholder record is not loaded unless explicitly needed.
**Accuracy:** source data comes from the policy management system (single source of truth). AI outputs are recommendations, not final decisions — a human underwriter makes the final call.

### 3. Risk assessment

| Risk | Likelihood | Severity | Mitigation |
|------|------------|----------|------------|
| AI produces incorrect coverage recommendation → wrong claim decision | Medium | High | Human-in-the-loop mandatory for all decisions. AI output labeled as recommendation, not decision. |
| Indirect prompt injection via claim documents → data leak | Low | High | Content sanitization, marker tokens, output classifier, DLP |
| Tenant isolation failure → wrong policyholder data retrieved | Low | Critical | Per-tenant indexes, row-level filtering, quarterly penetration test |
| Data breach of vector store | Low | High | Encryption at rest, access controls, backup encryption |
| Excessive data retention → GDPR breach | Medium | Medium | Automated retention enforcement (see Data Retention) |
| Model bias → discriminatory decisions | Medium | High | Bias evaluation on demographic subgroups, mandatory human review |

### 4. Residual risks and measures
Residual risk after mitigations: **Low — acceptable for deployment**.
Measures taken: [list all mitigations above with implementation status].

### 5. DPO consultation
Consulted: [DPO name], [date]. Opinion: [summary].

### 6. Supervisory authority consultation
Required if residual risk remains high after measures. [Not required here — residual risk is Low.]

### 7. Review schedule
DPIA to be reviewed: annually, or when processing changes materially (new data categories, new model, new use cases).

**Approved by:** [Data Controller representative]
**Date:** YYYY-MM-DD
**Version:** 1.0
```

### DPIA register

Maintain a DPIA register (required under GDPR Article 30 for large organizations):

```markdown
| Processing activity | DPIA ref | Date | Status | Next review |
|---------------------|----------|------|--------|-------------|
| Insurance Copilot — claim analysis | DPIA-2026-001 | 2026-08-01 | Approved | 2027-08-01 |
| Knowledge Platform — employee queries | DPIA-2026-002 | 2026-09-01 | In review | — |
```

---

## Data Retention

### Retention policy by data category

| Data category | Retention period | Legal basis | Deletion method |
|---|---|---|---|
| User queries (text) | 12 months | Legitimate interest (quality, eval) | Hard delete from audit DB |
| LLM responses (text) | 12 months | Same | Hard delete |
| Trace data (Langfuse) | 6 months | Operational necessity | Langfuse built-in TTL |
| Audit logs (access, decisions) | 7 years (insurance) / 5 years (GDPR baseline) | Legal obligation | Immutable archive, then delete |
| Model outputs used as training data | As long as model is in production + 2 years | Legitimate interest | Delete from training set + re-fine-tune without |
| PII in corpus chunks | Until source document deleted + right-to-be-forgotten propagation | Contract / consent | See below |
| Backup data | Match primary retention + 30 days | Operational | Automated backup TTL |
| Kubernetes logs | 30 days | Operational | Log rotation |
| Security logs (auth, access) | 1 year | Security, legal | Immutable archive, then delete |

Retention periods for insurance data are jurisdiction-specific — confirm with legal counsel.

### Automated retention enforcement

Retention must be automated — relying on manual deletion is an audit failure.

```python
# Scheduled job: runs nightly, deletes expired records
async def enforce_retention():
    cutoff_queries = datetime.utcnow() - timedelta(days=365)
    deleted = await db.execute(
        "DELETE FROM query_log WHERE created_at < :cutoff RETURNING id",
        {"cutoff": cutoff_queries}
    )
    audit_log.write(
        event="retention_enforcement",
        table="query_log",
        records_deleted=len(deleted),
        cutoff=cutoff_queries.isoformat()
    )
    # Also delete associated embeddings and cached responses
    await delete_associated_embeddings(deleted_ids=deleted)
    await semantic_cache.invalidate_for_queries(deleted_ids=deleted)
```

### Right-to-be-forgotten (GDPR Article 17)

When a data subject requests deletion of their data, the deletion must cascade through the entire AI pipeline:

```
Data subject request received → Legal validation (is the request valid?)
  ↓
Identify all records for this subject (query_log, audit_log, corpus chunks)
  ↓
Delete from source database
  ↓
Delete all derived corpus chunks (WHERE source_doc_id IN (...))
  ↓
Delete all embeddings (in vector DB, by document ID filter)
  ↓
Invalidate semantic cache entries derived from these documents
  ↓
Invalidate any prompt-cached responses that included this data
  ↓
Log deletion event with timestamp and scope (for accountability)
  ↓
Confirm to data subject within 30 days (GDPR deadline)
```

Test this propagation path in staging before any real data enters the system.

---

## Legal Review

### What requires legal sign-off before deployment

| Item | Who reviews | Trigger |
|---|---|---|
| Data Processing Agreements (DPA) with LLM vendors | Legal + DPO | Before sending any personal data to a third-party API |
| Terms of Service for open model licenses | Legal | Before using any open model in production |
| Client contracts (SLA, data processing, liability) | Legal | Before onboarding first paying client |
| DPIA | DPO ± supervisory authority | Before high-risk processing |
| AI Act risk classification | Legal + technical | Before deploying any system in scope |
| Insurance-specific regulatory compliance | Compliance officer + legal | Before any claim-affecting AI output |
| Employment law (if AI affects HR decisions) | Legal + HR | Before any HR-related AI feature |

### DPA checklist for LLM vendors

When using a Frontier API (OpenAI, Anthropic, etc.) with personal data:

```markdown
- [ ] DPA signed with the vendor
- [ ] Data processing location confirmed (EU or SCCs in place for US transfers)
- [ ] Vendor's sub-processor list reviewed and accepted
- [ ] Data retention by vendor confirmed (e.g., 30 days, 0 days with "no training" option)
- [ ] Security certifications verified (SOC 2 Type II, ISO 27001)
- [ ] Incident notification timeline confirmed (typically 72 hours)
- [ ] Right to audit or third-party audit report available
```

**For Project 3 (sovereign, on-prem):** no DPA needed for the LLM itself because data never leaves your infrastructure. DPAs still needed for any third-party monitoring tools, backup storage providers, etc.

### Open model licensing review

Before deploying any open model in production:

```markdown
| Model | License | Commercial? | Attribution required? | Training data restrictions? | Notes |
|-------|---------|-------------|----------------------|----------------------------|-------|
| Llama 3.x | Meta Community License | Yes (with terms) | No | No use for training competing models | Review 700M MAU clause |
| Qwen 3 | Apache-2.0 | Yes | Yes (in docs) | No | Cleanest license |
| Mistral | Apache-2.0 | Yes | Yes (in docs) | No | |
| DeepSeek-R1 | MIT | Yes | No | No | |
```

If you significantly fine-tune a model, legal must assess whether you become the AI Act "provider" of a new model — with full compliance obligations including conformity assessment.

---

## Model Governance

### Model registry

Every model used in production is registered. No unregistered model serves production traffic.

```markdown
## Model Registry

| ID | Model name | Version | Purpose | Risk class | Deployed | Approved by | Review date |
|----|-----------|---------|---------|-----------|---------|-------------|------------|
| M-001 | Qwen3-8B | 3.0 | RAG generator (Project 3) | High-risk | 2026-09-01 | [name] | 2027-03-01 |
| M-002 | bge-large-en | 1.5 | Embedding (all projects) | Limited risk | 2026-08-01 | [name] | 2027-02-01 |
| M-003 | BGE-Reranker-v2 | 2.0 | Reranking (all projects) | Minimal risk | 2026-08-01 | [name] | 2027-02-01 |
| M-004 | Qwen3-4B | 3.0 | Judge / classifier | Limited risk | 2026-09-01 | [name] | 2027-03-01 |
```

### AI Act risk classification

Every model or AI system must be classified before deployment:

| Risk class | Definition | Obligations |
|---|---|---|
| **Unacceptable** | Prohibited by AI Act (social scoring, real-time biometric surveillance in public) | Do not build |
| **High-risk** | Significant impact on individuals: insurance decisions, credit, employment, healthcare | Conformity assessment, DPIA, human oversight, logging, registration in EU database |
| **Limited risk** | Transparency obligation (e.g., must disclose it's AI-generated) | Disclose AI nature to users |
| **Minimal risk** | Everything else | No mandatory obligations (voluntary codes of conduct) |

**Project 3 (Insurance Copilot):** likely **High-risk** under Annex III (AI systems used for insurance decisions affecting individuals). Confirm with legal counsel.

High-risk obligations checklist:
```markdown
- [ ] Technical documentation prepared (Article 11)
- [ ] Logging of system operation throughout lifecycle (Article 12)
- [ ] Transparency to users — AI nature disclosed (Article 13)
- [ ] Human oversight measures implemented (Article 14)
- [ ] Accuracy, robustness, cybersecurity measures (Article 15)
- [ ] Conformity assessment completed (Article 43)
- [ ] Registration in EU AI Act database (Article 51)
- [ ] Post-market monitoring plan (Article 61)
```

### Model change control

No model change in production without going through change control:

```markdown
## Model Change Request — MCR-2026-042

**Change:** Replace Qwen3-8B with Qwen3-14B for insurance copilot generator
**Requestor:** [name]
**Date:** 2026-10-01

### Impact assessment
- Risk class change: No (still High-risk)
- Performance change: +8% groundedness on golden set (see eval report)
- Latency change: +400ms p95 (requires SLO review)
- Cost change: +35% per query (requires FinOps review)
- VRAM change: 14B at INT8 requires 14GB vs 8GB (confirm GPU capacity)

### Eval evidence
- [ ] Golden set: 95.2% groundedness (was 88.1%) — improvement confirmed
- [ ] Adversarial set: 97.8% refusal rate (was 96.1%) — improvement confirmed
- [ ] Regression: no degradation on any existing test case
- [ ] Shadow mode: ran for 7 days, results statistically better (p < 0.05)

### Approval
- [ ] Technical lead approval
- [ ] DPO sign-off (model change with same data = no new DPIA needed)
- [ ] Compliance officer sign-off (AI Act technical documentation updated)
- [ ] CISO sign-off (supply chain: Cosign signature verified for new weights)

### Rollout plan
- [ ] Canary: 5% traffic for 7 days
- [ ] Promotion: 25% → 50% → 100% over 2 weeks
- [ ] Rollback criterion: groundedness drops below 92% during canary

**Approved:** [names + date]
```

---

## Audit Log Architecture

### What to log

Audit logs for regulated AI systems are not application logs — they are a legal record. They must be tamper-proof, queryable, and retained for the legally required period.

| Event | Fields to log |
|---|---|
| User query | timestamp, user_id, tenant_id, query_hash (not raw text for PII), session_id |
| RAG retrieval | query_id, retrieved_doc_ids, retrieval_scores, retrieval_latency_ms |
| LLM response | query_id, model_name, model_version, prompt_version, response_hash, groundedness_score, latency_ms, cost_usd |
| Decision record | query_id, decision_type, decision_value, human_reviewer_id (if applicable), timestamp |
| User authentication | user_id, ip_address, event_type (login/logout/failed), timestamp |
| Data access | user_id, resource_type, resource_id, action (read/write/delete), timestamp |
| Model change | model_id, old_version, new_version, changed_by, timestamp, mcr_id |
| Secret access | secret_path, accessor_id, timestamp (from Vault audit log) |
| Admin action | admin_id, action, target_resource, timestamp |
| Data deletion (retention enforcement) | records_deleted, table, cutoff_date, triggered_by |

### Audit log storage and tamper-proofing

```python
# Every audit entry is immutable — no UPDATE or DELETE
# Use an append-only table with a sequential integrity chain

async def write_audit_entry(event: AuditEvent) -> None:
    # Get previous entry hash for chain integrity
    prev_hash = await db.fetchval(
        "SELECT entry_hash FROM audit_log ORDER BY id DESC LIMIT 1"
    )
    # Hash this entry chained to the previous
    entry_json = event.model_dump_json()
    entry_hash = hashlib.sha256(
        f"{prev_hash}{entry_json}".encode()
    ).hexdigest()

    await db.execute(
        """INSERT INTO audit_log (timestamp, event_type, payload, entry_hash)
           VALUES ($1, $2, $3, $4)""",
        event.timestamp, event.event_type, entry_json, entry_hash
    )
    # Audit entries are never updated or deleted within retention period
```

For Project 3: ship audit logs to **Loki** (append-only log store) with **immutable log storage** enabled. Loki's chunk hashing provides tamper evidence.

### Audit log access controls

```
compliance-officer role → read access to audit_log (query, aggregate, export)
rag-admin role → read access to audit_log for their tenant only
rag-api service account → write access only (append, never read)
no role → delete, update (enforced by DB constraint: row-level security)
```

### Audit trail for AI Act (Project 3)

Every AI-assisted decision must be reconstructable from the audit log:

```sql
-- Reconstruct what the AI saw and said for decision DEC-2026-4521
SELECT
  al.timestamp,
  al.payload->>'query' AS user_query,
  al.payload->>'retrieved_docs' AS sources_retrieved,
  al.payload->>'model_name' AS model_used,
  al.payload->>'model_version' AS model_version,
  al.payload->>'groundedness_score' AS groundedness,
  al.payload->>'decision_value' AS ai_recommendation,
  al.payload->>'human_reviewer_id' AS reviewed_by
FROM audit_log al
WHERE al.payload->>'decision_id' = 'DEC-2026-4521'
ORDER BY al.timestamp;
```

This query must be answerable at any time during the retention period. Regulators, DPOs, and courts may ask for it.

---

## Change Management

### Change categories

| Category | Examples | Approval required | Change window |
|---|---|---|---|
| **Standard** | Pre-approved, low-risk, well-tested: routine dependency update, minor config | Team lead | Any time |
| **Normal** | Planned changes: prompt update, model upgrade, new feature | Change Advisory Board (CAB) | Scheduled maintenance window |
| **Emergency** | P1 incident fix, critical security patch | CISO + Engineering lead (async) | Any time, post-hoc review |
| **Significant** | New AI capability, new data source, new model risk class | CAB + Compliance + Legal | Planned, with DPIA review if needed |

### Change Advisory Board (CAB)

For regulated industries, the CAB includes:
- Engineering lead
- Compliance officer
- DPO (for changes affecting personal data processing)
- Security lead
- Business owner

CAB meeting: weekly, 30 minutes. Emergency changes can be approved async by quorum (≥ 3 of 5 members).

### Change request template

```markdown
## Change Request — CR-2026-087

**Title:** Update RAG answer prompt from v1.2 to v1.3
**Category:** Normal
**Requestor:** [name]
**CAB meeting:** 2026-10-15

### Description
Add instruction to always cite article numbers when referencing AI Act requirements.
No model change. No data change.

### Risk assessment
- Risk: Low — additive instruction change
- Rollback: flip prompt registry alias back to v1.2 (< 1 minute, no downtime)

### Evidence
- Eval results: groundedness 96.1% (was 95.8%), citation accuracy 98.2% (was 94.1%)
- Shadow mode: ran 3 days, no regressions

### Change window
2026-10-16 22:00–22:15 UTC (low traffic, 15 min)

### Rollback criteria
If groundedness drops below 92% in the first 24h → auto-rollback via feature flag

### Post-change validation
- [ ] 20 test queries run after deployment
- [ ] Grafana dashboard checked for anomalies
- [ ] On-call engineer monitoring for 30 minutes post-change

**CAB approval:** [names + date]
```

### Maintenance windows

Scheduled maintenance must be communicated to clients per the SLA (typically 5 business days' notice):

```markdown
## Maintenance Notice — 2026-10-16

**Window:** 2026-10-16 22:00–00:00 UTC (2 hours maximum)
**Expected downtime:** < 5 minutes (rolling restart)
**Changes:** Prompt update v1.3, dependency upgrades, PostgreSQL minor version update
**Rollback plan:** Automated, < 1 minute if needed
**Contact during maintenance:** [on-call contact]
```

---

## Cost Controls

### Cost governance structure

| Level | Owner | Mechanism |
|---|---|---|
| Per-request | Application | Token cap per request, semantic cache, model cascade |
| Per-user / per-tenant | Application | Daily token budget per user, hard kill on overrun |
| Per-feature | Engineering lead | Feature-level budget tag, per-feature dashboard |
| Per-environment | Engineering lead | Dev/staging token quotas (10× lower than prod) |
| Total monthly | Finance + Engineering | Cloud budget alert at 50%, 80%, 100% of monthly cap |

### Token budgets in code

```python
# Per-request token cap
MAX_INPUT_TOKENS = 4096
MAX_OUTPUT_TOKENS = 1024

# Per-user daily budget (in USD)
async def check_user_budget(user_id: str) -> None:
    spent_today = await budget_db.get_daily_spend(user_id)
    if spent_today > settings.USER_DAILY_BUDGET_USD:
        raise BudgetExceededError(
            f"Daily query budget exceeded. Resets at midnight UTC."
        )

# Per-tenant monthly budget
async def check_tenant_budget(tenant_id: str) -> None:
    spent_this_month = await budget_db.get_monthly_spend(tenant_id)
    limit = await tenant_db.get_budget_limit(tenant_id)
    if spent_this_month > limit * 0.90:
        await notify_tenant_admin(tenant_id, spent_this_month, limit)
    if spent_this_month > limit:
        raise TenantBudgetExceededError("Monthly AI budget exhausted. Contact your administrator.")
```

### Cloud cost alerts (managed cloud)

```yaml
# Azure / AWS budget alert (via Terraform)
resource "aws_budgets_budget" "rag_monthly" {
  name         = "rag-platform-monthly"
  budget_type  = "COST"
  limit_amount = "5000"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator = "GREATER_THAN"
    threshold           = 50
    threshold_type      = "PERCENTAGE"
    notification_type   = "ACTUAL"
    subscriber_email_addresses = ["finops@company.com", "engineering-lead@company.com"]
  }

  notification {
    comparison_operator = "GREATER_THAN"
    threshold           = 90
    threshold_type      = "PERCENTAGE"
    notification_type   = "FORECASTED"
    subscriber_email_addresses = ["finops@company.com", "cto@company.com"]
  }
}
```

### Showback and chargeback

From Stage 3 (multi-tenant):
- **Showback:** show each tenant their monthly AI cost (no billing adjustment — transparency only)
- **Chargeback:** bill each tenant for their actual AI cost (requires metering infrastructure)

```sql
-- Monthly cost report per tenant
SELECT
  tenant_id,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  SUM(cost_usd) AS total_cost_usd,
  COUNT(*) AS total_queries,
  AVG(cost_usd) AS avg_cost_per_query
FROM query_cost_log
WHERE created_at >= date_trunc('month', now())
GROUP BY tenant_id
ORDER BY total_cost_usd DESC;
```

### FinOps dashboard metrics

Track weekly:
- Total AI cost (by model, by feature, by tenant)
- Cost per resolved query (target: < €0.05)
- Cache hit rate (target: > 60%)
- Cascade routing ratio (% of queries served by SLM vs Frontier)
- Wasted spend (queries that failed or were refused — cost with no value delivered)
- Month-over-month cost trend vs query volume trend (efficiency ratio)

A cost that grows faster than query volume means you are getting less efficient — investigate.
