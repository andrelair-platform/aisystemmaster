# Model Selection

## The Core Mental Shift

A beginner picks one LLM. An AI Systems Engineer picks a **model portfolio** — multiple specialized models, each chosen for what it does best.

```
AI System = Embedding Model
          + Reranker
          + Generator (Frontier or Open)
          + Reasoning Model (for planning)
          + Vision Model (if documents include images)
          + Judge Model (for evaluation)
          + Optional: Fine-tuned domain model
```

The question is never "which LLM?" — it is "which combination of models performs retrieval, reranking, reasoning, evaluation, and generation for this workflow?"

---

## The 12 Model Categories

| # | Category | Examples | When to use |
|---|---|---|---|
| 1 | **Frontier** | Claude Opus/Sonnet, GPT-4o, Gemini 2.5 Pro | Complex reasoning, multi-step synthesis, enterprise copilots. Most capable, most expensive. |
| 2 | **Open (self-hostable)** | Llama 3.x, Qwen 3, Mistral, DeepSeek, Gemma | Sovereign/on-prem deployment, privacy, cost control. Required for regulated-industry buyers. |
| 3 | **Small Language Models (SLMs)** | Gemma 3 4B, Phi-4, Qwen 3 4B, Llama 3.2 3B | Classification, extraction, routing, simple agents. SLM + good RAG often beats Frontier + poor RAG at 1/20th the cost. |
| 4 | **Embedding** | text-embedding-3-large, bge-large-en, e5-large-v2 | Every RAG system — no embeddings, no semantic retrieval. |
| 5 | **Reranker** | BGE Reranker v2, Cohere Rerank, Jina Reranker | Top-100 retrieve → rerank → top-10 to LLM. Single biggest RAG quality lever after hybrid search. |
| 6 | **Reasoning** | OpenAI o3/o4, DeepSeek-R1, Qwen-3 thinking mode | Multi-step agent planning, complex analysis, chain-of-thought tasks. Slower and pricier — use selectively. |
| 7 | **Vision** | GPT-4o Vision, Gemini Vision, Llama Vision, ColPali | Invoice photos, scanned PDFs, claim images, medical imaging. ColPali for visual document retrieval. |
| 8 | **Speech** | Whisper (self-host), Deepgram, Gemini Audio | Call centres, meeting transcription, voice agents. |
| 9 | **Multimodal** | GPT-4o, Gemini 2.5, Claude Sonnet | Mixed text + image + audio pipelines. |
| 10 | **Code** | DeepSeek Coder, Qwen Coder, Codellama | Tool generation, code review agents, CI agents. |
| 11 | **Fine-tuned** | LoRA / QLoRA on Llama, Qwen, Mistral | Domain vocabulary, tone, structured output format. Not a substitute for RAG — use when the base model consistently fails on domain-specific phrasing. |
| 12 | **Domain-specific** | Medical AI, Legal AI, Insurance AI | Often outperform frontier models on narrow tasks. Evaluate before assuming Frontier wins. |

---

## Decision Framework

### Step 1 — Map the task to a model role

| Task | Primary model role |
|---|---|
| Turn query into vector | Embedding |
| Retrieve candidates | Embedding + Vector DB |
| Cut 100 results to 10 | Reranker |
| Generate answer from context | Frontier or Open Generator |
| Plan multi-step agent workflow | Reasoning |
| Score answer quality | Judge (smaller capable model) |
| Parse claim photo or scanned PDF | Vision |
| Transcribe meeting or call | Speech |
| Classify, extract, route | SLM |
| Generate code for tool | Code model |

### Step 2 — Apply the constraint filter

| Constraint | Implication |
|---|---|
| Data must not leave org perimeter | Open self-hosted only — no Frontier API |
| Budget < €0.02/query | SLM + good RAG; Frontier only for escalation |
| p95 latency < 1s | Eliminate reasoning models from the hot path |
| Regulated industry (AI Act, GDPR) | Prefer open model with signed container + SBOM |
| Multi-tenant SaaS | Shared embedding model OK; per-tenant indexes |
| Images / scanned docs in corpus | Add Vision model + ColPali for retrieval |

### Step 3 — Build the cascade

Default cascade architecture (cheapest first, escalate on low confidence):

```
Query
  ↓
SLM classifier (is this in scope? simple or complex?)
  ├── Simple + in-scope → SLM generator (fast, cheap)
  └── Complex or uncertain → Frontier generator (quality)
                                ↓
                           Reasoning model (only for multi-step planning)
```

This single pattern typically cuts cost 60–90% vs always using Frontier.

---

## Trade-Off Matrix

### Frontier API vs Self-Hosted Open Model

| Dimension | Frontier API | Self-Hosted Open |
|---|---|---|
| Quality (general) | Higher | Lower, but closes fast |
| Quality (domain, with fine-tune) | Moderate | Can exceed Frontier |
| Cost | Per-token, predictable | Infra cost (GPU), scales at zero marginal cost |
| Latency | Network + queue dependent | Controlled, local |
| Data sovereignty | Data sent to vendor | Stays in perimeter |
| Compliance (AI Act, GDPR) | Harder — vendor DPA required | Easier — you control the stack |
| Ops burden | Low | High (GPU infra, updates, monitoring) |
| When to choose | Managed cloud, speed to market, non-regulated | Regulated industries, on-prem mandates, high volume |

### Long Context vs RAG

| Dimension | Long Context | RAG |
|---|---|---|
| Freshness | Stale (at inference time) | Fresh (retrieve at query time) |
| Cost | Quadratic in some setups | Retrieval + shorter context |
| Citation | Hard (LLM must cite from a wall of text) | Natural (retrieved chunks are the sources) |
| Scale | Limited by context window | Scales to millions of documents |
| When to choose | Small, stable corpus; one-shot summarization | Large, evolving corpus; multi-source Q&A |

### Fine-Tuning vs Better RAG vs Better Prompting

| Approach | Fixes | Does not fix |
|---|---|---|
| Better prompting | Instruction-following, output format | Missing knowledge, wrong facts |
| Better RAG | Missing knowledge, factual errors | Style, format, domain vocabulary |
| Fine-tuning | Style, vocabulary, structured output, instruction-following | Missing knowledge (still needs RAG for facts) |

**Rule:** try better RAG first. Fine-tune only when the base model consistently fails on domain-specific phrasing, tone, or output format — not for knowledge injection.

### Dense vs Hybrid Retrieval

| Dimension | Dense only | Hybrid (BM25 + dense) |
|---|---|---|
| Semantic recall | High | High |
| Exact-match recall (IDs, codes, names) | Low | High |
| Cost | Embedding only | BM25 is free |
| When to choose | Never in production | Always |

---

## Model Portfolio Per Project

### Project 1 — Enterprise Knowledge Platform

| Role | Model | Rationale |
|---|---|---|
| Embedding | text-embedding-3-large or bge-large | High recall on technical docs |
| Reranker | BGE Reranker or Cohere Rerank | Quality gate before generation |
| Generator | Claude Sonnet or GPT-4o (Frontier, managed cloud) | Complex multi-source synthesis |
| Judge | Claude Haiku or GPT-4o-mini | Cost-efficient groundedness scoring |

Benchmark to publish: **SLM + RAG vs Frontier + RAG** — demonstrates cost/quality trade-off reasoning.

### Project 2 — Workflow Automation Platform

| Role | Model | Rationale |
|---|---|---|
| Planner | DeepSeek-R1 or OpenAI o3-mini | Multi-step workflow planning |
| Synthesizer | Frontier (Claude Sonnet / GPT-4o) | Final output quality |
| Tool executor | Qwen Coder or DeepSeek Coder | Structured tool call generation |
| Classifier/router | Qwen 3 4B (SLM) | Route simple tasks away from Frontier |
| Judge | Smaller capable model | Action correctness, idempotency check |

### Project 3 — Insurance / Compliance Copilot

| Role | Model | Rationale |
|---|---|---|
| Generator | Llama 3.x or Qwen 3 (self-hosted, vLLM) | Sovereign — data never leaves perimeter |
| Vision / OCR | Llama Vision or ColPali | Claim photos, scanned policy docs |
| Embedding | bge-large (self-hosted) | Embeddings carry regulated data — must stay on-prem |
| Reranker | BGE Reranker (self-hosted) | No external API calls on regulated corpus |
| Fine-tune | LoRA on base model, insurance corpus | Domain terminology, structured output for decisions |
| Judge | Smaller open model (self-hosted) | AI Act: judge must also stay in perimeter |

---

## Numbers to Know in Interviews

| Fact | Value |
|---|---|
| Embedding dimensions | 768 (bge-base), 1024 (bge-large), 3072 (text-embedding-3-large) |
| Storage per 1M chunks at 1024 dims, float32 | ~4 GB |
| Frontier input cost range | €0.5–€5 per million tokens |
| SLM input cost (self-hosted, amortized GPU) | €0.01–€0.10 per million tokens |
| Prompt caching discount | 50–90% off cached input tokens |
| Reranker latency (cross-encoder, top-100) | 50–200ms |
| GPU VRAM for 7B model at FP16 / INT8 / INT4 | ~14 GB / ~7 GB / ~4 GB |
| GPU VRAM for 70B model at FP16 / INT8 / INT4 | ~140 GB / ~70 GB / ~35 GB |
| Speculative decoding speedup | 2–3× |
| Cost reduction from cascade routing | 60–90% |

---

## Open Model Licensing Quick Reference

| Model | License | Commercial use |
|---|---|---|
| Llama 3.x | Meta Community License | Yes, with acceptable-use policy; 700M-MAU clause |
| Qwen 3 | Apache-2.0 (most variants) | Yes — check tokenizer/data licenses |
| Mistral / Mixtral | Apache-2.0 | Yes |
| DeepSeek | MIT (most variants) | Yes — check per-variant |
| Gemma | Gemma Terms of Use | Separate commercial terms — read before shipping |
| Phi-4 | MIT | Yes |

Maintain this table per project. Lawyers will ask.
