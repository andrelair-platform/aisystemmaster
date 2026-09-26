---
id: llmops
title: "LLMOps"
sidebar_position: 4
---

## What LLMOps Is

LLMOps is the operational discipline for running LLM-based systems in production: deploying models and prompts safely, controlling costs, serving traffic reliably, and improving the system over time without breaking it.

It has two layers:
- **Prompt and model lifecycle** — versioning, testing, releasing, rolling back prompts and models
- **Inference operations** — serving infrastructure, cost control, latency, GPU efficiency

Both are required. Most "LLMOps" articles only cover the first.

---

## Prompt Lifecycle Management

### Prompts are code — treat them as code

Every prompt lives in Git. No prompt changes in production without a PR, a diff, and a passing eval suite.

**Directory structure:**
```
prompts/
  rag-answer/
    v1.0.0.md       ← system prompt text
    v1.0.0.eval.json ← eval results attached to this version
    v1.1.0.md
    v1.1.0.eval.json
  judge-groundedness/
    v1.0.0.md
  workflow-planner/
    v1.0.0.md
```

**Semver for prompts:**
- Patch (1.0.x): wording tweaks that don't change behavior
- Minor (1.x.0): behavior change, requires eval re-run
- Major (x.0.0): structural change, requires golden set review

### Prompt registry

A runtime service (or simple config) that maps `prompt_name + version` → prompt text. The application fetches the prompt at request time by name, never hardcodes it.

```python
# Fetches from registry (Redis, DB, or config file)
prompt = registry.get("rag-answer", version="1.1.0")
# Or use "latest-stable" alias for auto-promotion
prompt = registry.get("rag-answer", version="stable")
```

Benefits: rollback is a config change (flip `stable` alias), no redeploy needed.

### Prompt testing (unit level)

Before running the full golden set, run cheap prompt unit tests:

```python
# Test: does the prompt produce structured output?
response = llm.complete(prompt + test_input)
assert is_valid_json(response)
assert "citations" in json.loads(response)

# Test: does the prompt refuse out-of-scope?
response = llm.complete(prompt + out_of_scope_input)
assert "cannot answer" in response.lower()
```

Fast, cheap, runs in < 30s. Catches obvious breakage before the expensive golden set.

---

## Model Release Engineering

### Canary releases

Never flip 100% of traffic to a new model/prompt immediately.

```
Week 1: 5% of traffic → new model, 95% → old model
Week 2: Watch metrics (groundedness, latency, cost, error rate)
Week 3: If metrics hold → 25% → 50% → 100%
         If regression → flip back to 0%, investigate
```

Canary routing implemented via feature flags (see below) — no redeploy needed to adjust split.

### Shadow mode

New model runs alongside the old model on the same traffic. Results compared offline — users always see the old model's response. Zero risk to users, maximum signal.

```
User request → Old model → Response to user
            ↘ New model → Response to eval pipeline (not shown to user)
```

Use shadow mode before any canary. If shadow results are worse, don't canary.

### Feature flags for model routing

```python
# LaunchDarkly, Unleash, or a simple DB flag
flag = feature_flags.get("rag_generator_model", tenant_id=tenant_id)

if flag == "frontier":
    model = "claude-sonnet-4-6"
elif flag == "slm":
    model = "qwen3-4b-self-hosted"
else:
    model = DEFAULT_MODEL
```

This enables:
- Per-tenant model routing (give premium tenants Frontier, free tier gets SLM)
- A/B testing across cohorts
- Emergency rollback without redeploy

### A/B testing for prompts and models

For a statistically valid A/B test:
- Minimum sample size: ~500 interactions per variant (use a power calculator)
- Primary metric: groundedness rate or task completion rate
- Guard metrics: latency p95, cost per query, error rate
- Duration: run for at least 2 weeks to account for day-of-week effects
- Decision: if primary metric improves AND guard metrics don't degrade → promote

### Rollback playbook

When production regresses:

```bash
# 1. Flip feature flag to old model (< 1 minute, no redeploy)
feature_flags set rag_generator_model=frontier-v1 --env prod

# 2. Flip prompt registry alias to last green version (< 1 minute)
registry alias set rag-answer stable=v1.0.2

# 3. If infra-level change needed: ArgoCD rollback
argocd app rollback rag-api --revision <last-green-sha>

# 4. Verify: check groundedness on last 100 responses in Langfuse
# 5. Write incident report before investigating root cause
```

---

## Cost Engineering

### Lever 1 — Model cascade routing (biggest impact: 60–90% cost reduction)

```
Query arrives
  ↓
SLM classifier: simple or complex?
  ├── Simple + high confidence → SLM generator (€0.001/query)
  └── Complex or low confidence → Frontier generator (€0.05/query)
```

Confidence threshold is tunable — lower it to save cost, raise it to improve quality. Track both in your observability stack.

### Lever 2 — Prompt caching (50–90% off cached input tokens)

Cache the system prompt and static context prefix across requests:

- **Anthropic:** `cache_control: {"type": "ephemeral"}` on system prompt blocks — 5-minute TTL, up to 90% discount
- **OpenAI:** automatic prefix caching on inputs > 1024 tokens
- **vLLM (self-hosted):** `prefix_caching=True` in engine args — reuses KV cache for shared prefixes

**Track cache hit rate** as a first-class metric. A 70% hit rate means 70% of your input tokens cost ~10% of their nominal price.

### Lever 3 — Semantic caching (cache answers, not just KV)

Cache full responses keyed by semantic similarity of the query:

```python
# On query arrival:
query_embedding = embed(query)
cached = semantic_cache.lookup(query_embedding, threshold=0.95)
if cached:
    return cached.response  # free
# else: run the full pipeline and store result
semantic_cache.store(query_embedding, response)
```

Tools: GPTCache, Redis with vector similarity, Langfuse caching layer.

Huge win on FAQ-like traffic (support bots, regulatory Q&A with repeated questions).

### Lever 4 — Batch API for async workloads (50% cost reduction)

Any job that doesn't need a real-time response goes to the batch endpoint:
- Nightly corpus re-evaluation
- Bulk document summarization
- Offline eval suite runs
- Dataset enrichment

### Lever 5 — Context window discipline

Long contexts cost quadratically in some setups. Keep context tight:
- Retrieve 5–10 chunks, not 50
- Summarize conversation history instead of passing full history
- Use parent-document retrieval (small retrieval chunks, larger context chunks) to avoid bloat

### Lever 6 — Quantization for self-hosted models

| Format | VRAM vs FP16 | Quality loss | Use case |
|---|---|---|---|
| FP16 | 1× | None | Dev, quality benchmarking |
| INT8 (bitsandbytes / GPTQ) | ~0.5× | Minimal | Production default for 7–13B models |
| INT4 (GGUF / AWQ / GPTQ) | ~0.25× | Small | Edge, memory-constrained servers |
| GGUF (llama.cpp) | 0.25–0.5× | Small | CPU inference, local dev |

For Project 3: INT8 is the production default. INT4 for models running on commodity hardware.

---

## Inference Servers

### vLLM (recommended default for self-hosted)

Key features:
- **PagedAttention** — GPU memory manager for KV cache; eliminates fragmentation
- **Continuous batching** — non-negotiable for throughput; don't use naive batching
- **Prefix caching** — reuse KV cache for shared prompt prefixes across requests
- **Tensor parallelism** — split model across multiple GPUs (`--tensor-parallel-size N`)
- **Streaming** — first-token latency what users feel; always stream

```bash
vllm serve Qwen/Qwen3-8B \
  --tensor-parallel-size 2 \
  --max-model-len 32768 \
  --enable-prefix-caching \
  --dtype bfloat16
```

### SGLang

Best for structured generation (JSON, tool calls) and complex multi-call programs. RadixAttention for efficient prefix sharing. Choose over vLLM when your workload is heavily structured-output or tool-calling.

### TGI (Text Generation Inference)

HuggingFace's production server. Good default for HF-hosted models. Flash Attention 2, continuous batching, token streaming. Less flexible than vLLM for custom configurations.

### llama.cpp

CPU inference via GGUF quantized models. Use for: local dev without GPU, edge deployment, ultra-low-cost commodity servers. Not for high-throughput production.

### TensorRT-LLM

NVIDIA-optimized. Maximum throughput on H100/A100. Complex to set up, but 2–4× throughput improvement over vLLM on the right hardware. Use only when GPU costs dominate and you're on NVIDIA hardware.

---

## Inference Optimization Techniques

### Speculative decoding (2–3× speedup)

A small draft model proposes N tokens. The large model verifies them in a single forward pass — accepting or rejecting. Accepted tokens come "for free."

```
Draft model (Qwen 0.5B) → proposes ["The", "policy", "covers", "damage", "to"]
Verification model (Qwen 8B) → accepts ["The", "policy", "covers"] rejects ["damage"]
Net speedup: ~2.5× on typical insurance text
```

Best gain when draft and verifier are from the same model family (Qwen 0.5B + Qwen 8B).

### Parallelism strategies

| Strategy | When to use |
|---|---|
| **Tensor parallelism** | Model too large for one GPU; split layers across GPUs; low latency |
| **Pipeline parallelism** | Very large models (70B+); pipeline stages across GPUs; higher throughput |
| **Data parallelism** | Multiple independent model replicas; horizontal scaling |

For Project 3 (7B–13B open model on 2–4 GPUs): tensor parallelism with `--tensor-parallel-size 2`.

### Continuous batching

vLLM and TGI do this by default. Never use naive static batching (batch fills, waits for all to finish, returns). With continuous batching, new requests join the batch as others complete — maximizes GPU utilization.

### Streaming (mandatory)

Always stream tokens to the frontend. First-token latency is what users perceive. Full-response latency is irrelevant to UX if the first token arrives in < 500ms.

---

## Observability for LLMOps

Every request must emit:

| Metric | How |
|---|---|
| Input tokens | From model response headers |
| Output tokens | From model response headers |
| Cost per request | `input_tokens × input_price + output_tokens × output_price` |
| First-token latency | `time_to_first_token - request_start` |
| Full latency | `response_complete - request_start` |
| Model name + version | Tag on every trace |
| Prompt name + version | Tag on every trace |
| Cache hit (yes/no) | From prompt cache or semantic cache |
| Retrieval score (top chunk) | From vector DB |
| Judge score | From eval pipeline |
| Tenant ID | For per-tenant cost accounting |

Tool: Langfuse (self-hosted for Project 3, cloud for Projects 1–2) + Prometheus/Grafana for infra metrics.

**Dashboards to build:**
- Cost per query over time (by feature, by tenant, by model)
- Cache hit rate (prompt cache + semantic cache)
- p50 / p95 / p99 latency by model
- Groundedness rate (rolling 7-day)
- Token budget burn rate (daily, vs monthly cap)

---

## Incident Response

### Kill-switch

Every AI feature has a kill-switch: one config change disables AI output and falls back to a legacy UX (show raw search results, show "feature temporarily unavailable"). No redeploy needed.

```python
if feature_flags.get("rag_answer_enabled") is False:
    return fallback_search_results(query)
```

### Incident categories for AI systems

| Category | Symptoms | First action |
|---|---|---|
| Mass hallucination | Spike in low groundedness scores | Kill-switch → rollback prompt/model |
| Prompt injection breach | Unusual tool calls, data in responses that shouldn't be there | Kill-switch → audit logs → investigate retrieval |
| Cost spike | Token spend 10× normal | Rate limit immediately → identify runaway request pattern |
| Judge drift | Groundedness scores change without model change | Re-calibrate judge against human labels |
| Embedding index corruption | Retrieval returns irrelevant chunks | Re-index from source |
| Vendor outage | Frontier API returning 500s | Failover to self-hosted SLM (if available) or kill-switch |

### Post-mortem template

```
Incident: [title]
Date: [date]
Duration: [start → resolution]
Impact: [N users affected, $ cost, SLO breach?]

Root cause category: [ ] prompt  [ ] retrieval  [ ] model  [ ] tool  [ ] data  [ ] infra

Timeline:
  HH:MM — [event]
  HH:MM — [event]

Root cause: [one paragraph]

Contributing factors: [list]

Fix applied: [what was done]

Prevention: [what changes to make so this doesn't recur]

Eval set update: [what adversarial cases were added to the test suite]
```

The last line is mandatory — every incident must produce at least one new test case.
