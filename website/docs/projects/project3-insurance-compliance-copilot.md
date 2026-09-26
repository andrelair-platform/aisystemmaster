---
id: project3-insurance-compliance-copilot
title: "P3 — Insurance Compliance Copilot"
sidebar_position: 4
---

## Goal

Build a production AI system for regulated-industry document analysis — AI-Act-grade audit lineage, self-hosted open models on sovereign infrastructure, full PII pipeline, and citation-backed decision support.

This is the highest-credibility flagship because it targets the buyers most AI candidates cannot serve: insurers, banks, public sector, and any organization under EU AI Act or GDPR obligations.

Market categories addressed: **#6 Industry-Specific AI Products**, **#1 Enterprise Applications**

Business pains addressed:
- Making AI reliable and secure in regulated environments
- Measuring ROI with defensible methodology
- Regulatory integration (AI Act, GDPR)

---

## Corpus

**Minimum:** 2,000–10,000 documents

**Sources:**
- EU Publications Office — AI Act, GDPR, NIS2 primary sources
- Insurance regulators (EIOPA, national regulators)
- OECD insurance and risk publications
- Internal-style mock policy and claims documents

**Google operators to find PDFs fast:**
```
site:eur-lex.europa.eu filetype:pdf "artificial intelligence"
site:eiopa.europa.eu filetype:pdf
site:oecd.org filetype:pdf "insurance"
"claims processing" filetype:pdf site:gov
```

---

## Architecture

```
User (underwriter, compliance officer, claims handler)
  ↓
Frontend (citation rendering, confidence visualization, structured output)
  ↓
Backend API (tenant-isolated, Keycloak OIDC)
  ↓
Hybrid Retrieval (BM25 + dense) + Knowledge Graph (policy ↔ claim ↔ claimant ↔ history)
  ↓
Reranker
  ↓
Open Self-Hosted Model (Llama / Qwen / Mistral via vLLM)
  ↓
Vision Model (claim photos, scanned PDFs — ColPali / Llama Vision)
  ↓
Evaluation Model (AI-as-judge, groundedness, AI Act compliance check)
  ↓
Loki Audit Trail (every query, retrieved doc, model output, decision logged)
  ↓
Observability (Prometheus, Grafana, Jaeger, Langfuse)
```

---

## Model Portfolio

| Role | Choice | Rationale |
|---|---|---|
| Generator | Llama / Qwen / Mistral (self-hosted, vLLM) | Sovereign deployment — no data leaves the perimeter |
| Vision / OCR | Llama Vision or ColPali | Claim photos, scanned insurance documents |
| Embedding | bge-large or e5-large (self-hosted) | Sovereign — embeddings carry semantic content of regulated data |
| Reranker | BGE Reranker (self-hosted) | Quality lever, no external API calls |
| Fine-tune | LoRA on base model over insurance corpus | Domain-specific terminology and reasoning |
| Judge | Cheaper open model | Groundedness + AI Act compliance check |

**Key architectural decision:** open self-hosted model on sovereign stack, not Frontier API. This is the architecture regulated buyers actually want. Frontier API is acceptable for dev/eval only.

---

## Knowledge Graph

A flat vector index is insufficient for insurance. Build a knowledge graph:

```
Policy ─── covers ──→ Claim
  │                      │
  └── issued to ──→ Claimant ←── has history ── Prior Claims
                        │
                        └── lives at ──→ Location / Risk Zone
```

Graph traversal enables multi-hop reasoning: "Has this claimant made similar claims on this type of policy in the past three years?" — a query that beats pure vector retrieval every time.

Stack: Neo4j or equivalent (self-hostable on the sovereign platform).

---

## Sovereign Deployment Stack

Modelled on `andrelair-platform` GitHub organization:

| Layer | Tooling | Purpose |
|---|---|---|
| Orchestration | k3s | Lightweight Kubernetes, on-prem |
| GitOps delivery | ArgoCD | Reconcile cluster state from Git |
| Identity / auth | Keycloak (OIDC) | Per-tenant SSO, role-based access |
| Policy enforcement | OPA / Gatekeeper | Who can query what corpus |
| Audit trail | Loki | Every AI decision logged with lineage |
| Container registry | Harbor + Trivy | Vulnerability scanning |
| Supply chain | Cosign + SBOM | Signed model containers — required for AI Act |
| Secret management | Vault | API keys, model credentials |
| Storage | Longhorn | Persistent volumes for vector DB, model weights |
| Inference server | vLLM | Continuous batching, streaming, KV-cache reuse |
| Observability | Prometheus + Grafana + Jaeger + Langfuse | Metrics, traces, cost, latency |

**Every model container is signed with Cosign.** SBOM generated per release. This is what enterprises will demand for LLM workloads in 2026–2027.

---

## PII and Data Governance Pipeline

```
Document Ingest
  ↓
PII Detection (Presidio + NER classifier — emails, names, IDs, health codes)
  ↓
Redaction or Tokenization (policy defined per corpus type)
  ↓
Encryption at rest (vector store + metadata DB)
  ↓
Embedding (bge-large, self-hosted)
  ↓
Vector Store (with row-level tenant isolation)
  ↓
Lineage tracking (every chunk → source doc → retrieval timestamp)
```

**Right-to-be-forgotten propagation:** deleting a source document must cascade to every derived chunk, embedding, and cached answer. Build this before onboarding any real data.

**Data residency:** the vector DB is in-scope for residency rules — embeddings carry semantic content of regulated data. Every component runs in the declared EU region.

---

## Security

Full OWASP LLM Top 10 coverage:

| Threat | Mitigation |
|---|---|
| Indirect prompt injection (in retrieved docs) | Content sanitization at ingest, marker tokens around untrusted content, allowlisted tools |
| Sensitive data disclosure | PII pipeline, tenant isolation, output filters |
| Insecure output handling | Treat LLM output as untrusted — parse, validate, escape before rendering or acting |
| Tool-use abuse | Per-tool allowlist, sandboxed runtime, idempotency keys, dry-run by default |
| Excessive agency | Principle of least privilege; per-tool, per-tenant scopes |
| Supply chain | Cosign-signed containers, SBOM, hash-verified model weights |
| Model DoS / cost exhaustion | Per-user rate limits, per-request token caps, budget alarms |

**Provider vs deployer classification (AI Act):** if significant LoRA fine-tuning is applied, the deployer may become the *provider* of a new model with full compliance obligations. Maintain a one-line license and classification note per model shipped.

---

## AI Act Compliance Features

- Full audit lineage: every answer traces back to source document + chunk + retrieval timestamp
- Human-in-the-loop for high-stakes decisions (claims above threshold, coverage denials)
- Decision history with confidence scores stored and queryable
- Kill-switch per feature — disable AI output, fall back to manual UX, without redeploy
- Risk classification documented: this system is likely a **High-Risk AI system** under AI Act Annex III (insurance decisions affecting individuals)

---

## Retrieval Stack

- **Hybrid search (BM25 + dense)** — baseline always
- **Knowledge graph traversal** — multi-hop policy/claim/claimant reasoning
- **Reranker** — top-100 → top-10 before generation
- **ColPali** — for scanned PDFs and visual claim documents
- **Parent-document retrieval** — for long regulatory documents (AI Act articles, policy terms)
- **Contextual retrieval** (Anthropic pattern) — prepend LLM-generated context to each chunk before embedding, for high-value regulatory corpus

---

## Evaluation

**Offline eval (CI):**
- Golden dataset: 100–500 manually verified Q/A pairs on insurance and compliance scenarios
- Adversarial set: prompt-injection in retrieved docs, out-of-scope claims, factual traps from conflicting policies
- Regression suite blocks every PR

**Online eval:**
- Continuous sampling on live traffic
- Judge model checks groundedness + citation accuracy on every response

**Human eval:**
- Periodic review by domain expert (insurance or compliance professional) on hard samples
- Used to calibrate the judge model quarterly

---

## Six Benchmark Numbers to Publish

| Metric | Target |
|---|---|
| Groundedness rate | > 98% (higher bar — regulated decisions) |
| Citation accuracy | > 95% |
| Refusal rate on out-of-scope | > 95% |
| p95 end-to-end latency | < 3s |
| Cost per resolved query | < €0.05 (self-hosted cost model) |
| Hallucination rate on adversarial set | < 2% |

---

## SLOs

| SLO | Target |
|---|---|
| p95 latency | < 3s |
| First-token latency | < 500ms |
| Groundedness | > 98% |
| Availability | 99.5% |
| Audit log write latency | < 100ms (synchronous, before response returns) |

---

## Frontend Requirements

- **Citation rendering** — every claim links to the source chunk and document; click to view the paragraph
- **Confidence visualization** — show uncertainty score; especially for coverage decisions
- **Structured output** — tables, diffs, decision summaries — not walls of markdown
- **Approval / diff UI** — for agent-suggested actions (claim approve / deny / escalate)
- **Refusal states** — explain *why* the system can't answer; offer next steps

---

## Open Model Licensing

| Model | License | Commercial restriction |
|---|---|---|
| Llama | Meta community license | Acceptable-use clauses; 700M-MAU trigger |
| Qwen | Apache-2.0 (most variants) | Check tokenizer/data licenses separately |
| Mistral | Apache-2.0 | Commercial use permitted |
| DeepSeek | MIT (most) | Check per-variant |
| Gemma | Gemma Terms of Use | Separate commercial terms |

Maintain this table. Lawyers will ask.

---

## Definition of Done

- Live deployment on sovereign stack (k3s + ArgoCD + Keycloak + Harbor + Cosign)
- 2,000–10,000 documents ingested through the full PII pipeline
- Six benchmark numbers published with methodology
- Regression suite running in CI
- AI Act compliance documentation (risk classification, audit trail, lineage)
- LinkedIn post + deep technical writeup (2,000+ words)
- One real user (compliance or insurance professional) who has run > 50 queries

---

## Interview Anchors

> "Design a claims processing copilot for an insurer — must be AI-Act compliant and self-hosted."

> "Design a regulatory document Q&A system over 100k EU directives with full citation lineage."

This project is the live answer to both. Lead with the sovereign stack, the PII pipeline, the lineage trail, and the signed containers — that's the architecture regulated buyers can't get from a generic AI candidate.

---

## Deliverables

- Recorded demo (90 seconds — live query, citation, latency, cost card; record rather than live demo if sovereign-only)
- Deep technical writeup: problem, corpus, architecture, model choices (especially sovereign rationale), PII pipeline, eval methodology, AI Act compliance approach, six numbers, what failed
- Methodology page: corpus composition, PII handling policy, eval set construction, judge calibration, baselines compared
- Architecture diagram (single image, readable in 30 seconds)
- GitHub repo: clean README with six numbers at top, `make demo`, `make eval`, license table, SBOM reference
- One-pager case study (PDF, two-column) — framed for regulated-industry buyers
