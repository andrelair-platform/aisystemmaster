---
id: project1-enterprise-knowledge-platform
title: "P1 — Enterprise Knowledge Platform"
sidebar_position: 2
---

## Goal

Build a production RAG system that ingests, indexes, evaluates, and serves 10,000+ real documents across a real domain — not a single-PDF demo.

Market categories addressed: **#1 Enterprise Applications**, **#5 Enterprise Knowledge Systems**

Business pains addressed:
- Connecting AI to company data
- Making AI reliable and measuring ROI

---

## Corpus

**Minimum:** 10,000 documents

**Sources:**
- arXiv (AI, ML, Computer Science — bulk API or S3 dump)
- AWS, Azure, Kubernetes documentation
- GitHub READMEs and RFCs

**Ingestion pipeline:**
```
Source Crawlers (arXiv, sitemaps, GitHub, gov portals)
   ↓
Normalizer (PDF/HTML/DOCX/Markdown → clean Markdown + metadata)
   ↓
Deduplication + Language Detection
   ↓
Chunker + Embedder
   ↓
Vector Store + Metadata DB
   ↓
Evaluation Set Generator (sampled Q/A pairs per source)
   ↓
RAG / Agent / MCP Layer
   ↓
Observability + Feedback Loop
```

---

## Architecture

```
User
  ↓
Frontend (streaming UI, citation rendering)
  ↓
Backend API
  ↓
Hybrid Retrieval (BM25 + dense)
  ↓
Reranker (top-100 → top-10)
  ↓
Frontier / Reasoning Model
  ↓
Evaluation Model (AI-as-judge, groundedness)
  ↓
Observability (traces, cost, latency)
```

---

## Model Portfolio

| Role | Choice | Rationale |
|---|---|---|
| Embedding | text-embedding-3-large or bge-large | High-quality dense retrieval |
| Reranker | BGE Reranker or Cohere Rerank | Single biggest RAG quality lever after hybrid search |
| Generator | Frontier model (Claude Sonnet / GPT) | Complex reasoning, citations |
| Judge | Cheaper capable model | Groundedness + faithfulness scoring |

**Benchmark to publish:** SLM + RAG vs Frontier alone — demonstrates ROI thinking.

---

## Retrieval Stack

Baseline: **hybrid search (BM25 + dense)** — never pure dense; exact identifiers, IDs, and acronyms require lexical matching.

Additional techniques to apply:
- **Query rewriting / multi-query** — for short or ambiguous queries
- **Reranker** — always, if budget permits
- **Parent-document retrieval** — for long docs where precision needs surrounding context

---

## Security

- Content sanitization at ingest
- Marker tokens around retrieved chunks (to defend against indirect prompt injection)
- Output classifier for sensitive data disclosure

---

## Evaluation

**Offline eval (CI):**
- Golden dataset: 100–500 manually verified Q/A pairs, locked and versioned
- Regression suite runs on every PR; failure blocks merge

**Online eval:**
- Continuous sampling of live traffic
- Judge model + judge prompt versioned like code

**Adversarial set:**
- Prompt-injection attempts
- Out-of-scope questions
- Factual traps

---

## Six Benchmark Numbers to Publish

| Metric | Target |
|---|---|
| Groundedness rate | > 95% |
| Citation accuracy | > 90% |
| Refusal rate on out-of-scope | > 90% |
| p95 end-to-end latency | < 3s |
| Cost per resolved query | < €0.05 |
| Hallucination rate on adversarial set | < 5% |

---

## SLOs

| SLO | Target |
|---|---|
| p95 latency | < 3s |
| First-token latency | < 500ms |
| Availability | 99.5% |
| Groundedness | > 95% |

---

## Deployment

Managed cloud (Azure, AWS, or GCP). No sovereign constraint for this project.

---

## Definition of Done

- Live, queryable deployment
- 10,000+ documents ingested through the pipeline
- Six benchmark numbers published with methodology
- Regression suite running in CI
- LinkedIn post + deep technical writeup (2,000+ words)
- One real user who has run > 50 queries

---

## Interview Anchor

> "Design an enterprise knowledge assistant for 50,000 employees over 10 million internal documents."

This project is the live answer to that question. Bring corpus size, model portfolio rationale, retrieval stack, eval methodology, and the six numbers.

---

## Deliverables

- Live or recorded demo (90 seconds)
- Deep technical writeup: problem, corpus, architecture, model choices with rationale, eval methodology, six numbers, what failed, what you'd do differently
- Methodology page: corpus composition, eval set construction, judge calibration, baselines compared
- Architecture diagram (single image, readable in 30 seconds)
- GitHub repo: clean README with six numbers at top, `make demo`, `make eval`, license declared
- One-pager case study (PDF, two-column)
