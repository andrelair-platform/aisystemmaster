---
id: index
title: "Playbook"
sidebar_position: 1
---


After everything we've discussed (the book chapters, MCP, AI Act, enterprise AI, your background, your alternance, your goal of becoming an AI Systems Engineer by 2027), here's a single coherent playbook.

Not:

- Learn LangChain
- Learn RAG
- Learn MCP
- Learn Kubernetes

But:

> How do I become employable, credible, and eventually monetizable as an AI Systems Engineer?

---

## Ultimate Goal

By **September 2027**, be able to say:

> I can design, build, deploy, secure, evaluate, monitor, and improve production AI systems.

Not:

> I know how to call GPT.

**Production-scale principle:**

> The aim is to build **real production systems**, not toy demos that handle one PDF. Every flagship project must ingest, index, evaluate, and serve **hundreds to tens of thousands** of real documents — at realistic scale, with realistic noise, in realistic domains.

**Market-alignment principle:**

> Build toward what the market is actually paying for. The market in 2026 does not want people who train models — it wants engineers who **turn AI into business products and operational systems**. Every project, every skill, every public post is chosen because it maps directly to one of the six demand categories below.

**How to know you've arrived:**

> Reading this playbook is not the same as mastering it. Use the [**Mastery Checklist**](../mastery-checklist) — for every pillar it gives the concrete *proof artifact* and *expert bar* that separates "I read it" from "I can build and defend it."

---

## Level 0 — Your Position Today

**Current assets:**

- Alternance
- Real enterprise environment
- Fullstack background
- DevOps interest
- Cloud interest
- AI curiosity
- Time until September 2027

**Current gaps:**

- Production AI experience
- Enterprise AI portfolio
- Public proof
- Real users
- Case studies

---

## Level 0.5 — Market Demand (What Companies Actually Pay For in 2026)

Most companies are **not** looking for people who only know how to build AI models. They want engineers who can turn AI into **useful business products and operational systems**.

Demand splits into six categories. Every pillar and project below must map to at least one of them.

### 1. AI-Powered Enterprise Applications

AI integrated into existing workflows.

Examples:
- Customer support copilots
- Internal knowledge assistants (RAG)
- HR and recruitment assistants
- Legal document analysis
- Contract review
- Finance and accounting automation
- IT helpdesk assistants

Typical stack: LLMs · RAG · Vector DBs · APIs · Backend · Security/Permissions.

### 2. AI Agents & Workflow Automation

The fastest-growing area.

Examples:
- Invoice-processing agent
- Meeting-scheduling agent
- Sales-lead qualification agent
- Multi-agent business workflows

Tools: LangChain · LangGraph · CrewAI · MCP · Workflow orchestration.

### 3. AI Features Inside SaaS Products

Most companies don't want an "AI product." They want **AI features inside existing products**.

Examples:
- Smart search
- Auto-generated reports
- Document summarization
- AI chat
- Recommendation engines
- Intelligent form filling

This is where **Fullstack + AI** engineers are highly valuable.

### 4. Production AI Infrastructure

Large enterprises need people who can **operate AI reliably**.

Examples:
- LLM deployment
- GPU infrastructure
- Monitoring
- Cost optimization
- Prompt management
- Model routing
- AI observability

Skills: Kubernetes · Docker · Cloud · CI/CD · MLOps.

### 5. Enterprise Data & Knowledge Systems

Organizations sit on thousands or millions of documents.

Examples:
- Company-wide search
- Knowledge assistants
- Document intelligence
- Semantic search
- Data extraction

Tech: Vector DBs · RAG · Knowledge graphs · Data pipelines.

### 6. Industry-Specific AI Products

AI tailored to a sector.

Examples:
- Healthcare assistants
- Insurance claim analysis
- Legal research
- Real estate copilots
- Financial advisors
- Manufacturing quality control

---

### What enterprises are struggling with most in 2026

The pain points the market is actually paying to solve:

1. Connecting AI to company data.
2. Making AI reliable and secure.
3. Integrating AI into existing business processes.
4. Controlling AI costs.
5. Measuring ROI.
6. Automating repetitive work.

Every flagship project must visibly address at least 2 of these pains.

---

### Why your profile fits exactly here

Fullstack + Cloud + DevOps + AI = **AI Systems Engineer**.

This profile can build an **entire production AI product from idea to deployment** — which is exactly what startups and enterprises are hiring for. It is the convergence point of all six demand categories above.

---

## Pillar 1 — AI Foundations

**Goal:** Understand how AI systems work.

**Focus:**

- Foundation Models
- Evaluation
- Prompt Engineering
- RAG
- Agents
- Memory
- Finetuning
- Dataset Engineering
- Inference

**Outcome:**

You can explain:

- Why RAG?
- Why Agents?
- Why LoRA?
- Why Evaluation?
- Why MCP?

without touching code.

---

## Pillar 1.5 — The AI Model Landscape

When people say *"Use GPT-5"*, *"Use Claude"*, *"Use Gemini"* they are talking about **one category** of model. An AI Systems Engineer must know the **entire landscape** — because real systems combine many specialised models, not one giant LLM.

### The mental shift

A beginner thinks:

```
AI System = One LLM
```

An AI Systems Engineer thinks:

```
AI System = Many Specialized Models
          + RAG
          + Agents
          + MCP
          + Evaluation
          + Observability
```

The right question in enterprise AI is never *"Which LLM should we use?"* — it is:

> "Which combination of models should perform retrieval, reranking, reasoning, evaluation, and generation for this business workflow?"

### The model hierarchy

```
AI Models
│
├── Frontier Models
├── Open Models
├── Small Language Models (SLMs)
├── Embedding Models
├── Reranker Models
├── Reasoning Models
├── Vision Models
├── Speech Models
├── Multimodal Models
├── Code Models
├── Fine-Tuned Models
└── Domain-Specific Models
```

### The 12 categories — what to know, when to use

| # | Category | Examples | When to reach for it |
| --- | --- | --- | --- |
| 1 | **Frontier** | GPT-5, Claude Opus, Gemini 2.5 Pro, Grok 4 | Complex reasoning, research, enterprise copilots. Most capable, most expensive. |
| 2 | **Open (self-hostable)** | Llama, Qwen, Mistral, DeepSeek, Gemma | Sovereign / on-prem deployment, privacy, cost control. Critical for Project 3. |
| 3 | **Small Language Models (SLMs)** | Gemma 3 4B, Phi-4, Qwen 3 4B, Llama 3.2 3B | Classification, extraction, routing, simple agents. Often **SLM + RAG > giant LLM** for a specific task. |
| 4 | **Embedding** | text-embedding-3-large, bge-large, e5-large | Every RAG system. No embeddings = no semantic retrieval. |
| 5 | **Reranker** | BGE Reranker, Cohere Rerank | Top-100 retrieve → rerank → top-10 to LLM. The hidden RAG-quality lever. |
| 6 | **Reasoning** | OpenAI reasoning models, DeepSeek-R1, Qwen Reasoning | Multi-step planning, agent workflows, complex analysis. Slower & pricier. |
| 7 | **Vision** | GPT Vision, Gemini Vision, Llama Vision | Invoice/claim photos, OCR, medical imaging triage. |
| 8 | **Speech** | Whisper, Gemini Audio | Call centres, meeting transcription, voice agents. |
| 9 | **Multimodal** | GPT-5, Gemini, Claude | Mixed text + image + audio + video. Where the industry is heading. |
| 10 | **Code** | DeepSeek Coder, Qwen Coder, Codellama | Code generation, review, repair — including agentic dev tools. |
| 11 | **Fine-Tuned** | LoRA / full fine-tune of a base model | Take Llama, tune on insurance → insurance assistant. Common in enterprises. |
| 12 | **Domain-Specific** | Medical AI, Legal AI, Insurance AI, Finance AI | Often outperform frontier models on narrow tasks. |

### What a real AI system actually looks like

```
User
  ↓
Embedding Model      (turn query into vector)
  ↓
Vector DB            (retrieve candidates)
  ↓
Reranker             (cut 100 → top 10)
  ↓
Frontier / Reasoning Model   (generate answer)
  ↓
Evaluation Model     (AI-as-judge / groundedness)
  ↓
Observability        (trace, cost, latency)
```

Multiple models, each chosen for what it does best.

### What to master, in order

**Tier 1 — must know:**
- Frontier Models
- Open Models
- Embedding Models
- Reasoning Models

**Tier 2 — strong differentiators:**
- Rerankers
- Vision Models
- Speech Models

**Tier 3 — advanced:**
- Fine-Tuning (LoRA, QLoRA)
- Distillation
- Domain-Specific Models

### How this binds to the rest of the playbook

- **Project 1 (Knowledge Platform):** Embedding + Reranker + Frontier — and benchmark **SLM + RAG vs Frontier** to show ROI thinking.
- **Project 2 (Workflow Automation):** Reasoning model for planning + Frontier for synthesis + Code model for tool execution.
- **Project 3 (Insurance/Compliance Copilot):** **Open self-hosted model** (Llama / Qwen / Mistral) on the sovereign stack + Vision model for claim photos + domain-specific fine-tune. This is the architecture regulated buyers actually want.
- **Pillar 9 (DevOps):** "model routing" and "cost optimization" only make sense once you understand which categories you're routing between.
- **Pillar 4 (Evaluation):** AI-as-a-Judge is itself a model choice — usually a cheaper-but-capable model evaluating a more expensive one.

> A beginner picks an LLM. An AI Systems Engineer picks a **model portfolio**.

---

## Pillar 2 — AI Systems Engineering

This is where most engineers stop. **You should continue.**

**Learn:**

- LangGraph
- MCP
- Tool Calling
- Workflow Design
- Human-in-the-loop

**Mental model:**

```
Agent = Planning + Tools + Memory + Evaluation + Reliability
```

**Build — not tutorials. Real systems.**

Examples:

### Enterprise Knowledge Assistant
- RAG
- Evaluation
- Citations
- Observability

### Workflow Agent
- Approvals
- Human review
- Tool access
- Audit logs

### Claims Copilot
- Insurance
- Compliance
- Risk assessment
- Decision support

---

### Retrieval is a sub-discipline, not a checkbox

Most "RAG systems" you'll see in tutorials use one embedding model + cosine similarity + top-5. Production retrieval is far richer. Master the layers — they're independent levers you can pull to improve quality without changing the LLM.

| Technique | What it does | When to use |
| --- | --- | --- |
| **Hybrid search (BM25 + dense)** | Combines lexical (keyword) and semantic recall | Always. Pure dense misses exact identifiers, IDs, code, acronyms. |
| **Query rewriting / multi-query** | LLM rewrites the user's query into 3–5 variants before retrieval | Short, ambiguous, or conversational queries. |
| **HyDE (Hypothetical Document Embeddings)** | LLM drafts a fake "ideal answer," embed *that*, retrieve real docs near it | Open-ended questions where the user phrasing doesn't match doc phrasing. |
| **Contextual retrieval** (Anthropic pattern) | Prepend a short LLM-generated context summary to each chunk before embedding | High-value corpora where you can pay a one-time indexing cost for big recall gains. |
| **Parent-document / small-to-big retrieval** | Embed small chunks, return their larger parents to the LLM | Long docs (legal, regulation, manuals) where precision needs context. |
| **Late chunking** | Embed the whole doc, then chunk the resulting tokens | Preserves long-range context in embeddings. |
| **ColBERT / ColPali** | Token-level / image-patch-level late-interaction retrieval | Visual documents (scanned PDFs, slides). ColPali is the 2026 default for PDF-heavy corpora. |
| **GraphRAG** | Build a knowledge graph from the corpus, retrieve via graph + vector | Multi-hop reasoning across entities (insurance: claim → policy → claimant → history). |
| **Reranker** | Cross-encoder re-scores top-100 → top-10 | Always, if budget permits. Single biggest quality lever after hybrid search. |
| **Agentic / recursive retrieval** | Agent issues multiple retrieval calls, refining as it reads | Research-style questions, multi-document synthesis. |

**Rule of thumb:** if your RAG quality is bad, the first thing to fix is **retrieval**, not the LLM. 80% of RAG failures are retrieval failures.

---

### Agent reliability engineering

Pillar-2 agents fail in production for boring reasons, not because the planner is weak. Build for these from day one:

- **Budget caps per run** — max tokens, max tool calls, max wall-clock seconds. Hard kill on overrun.
- **Loop detection** — track repeated state hashes; if the agent revisits the same state N times, escalate to human.
- **Retries with backoff** — exponential backoff on tool failures, separate from LLM retries.
- **Idempotency keys** — every tool call (especially writes) carries an ID; replay never double-acts.
- **Sandboxing of tool calls** — agents touching the filesystem, network, or business systems run in a constrained scope, not as a root principal.
- **Deterministic replay** — log inputs, outputs, and seeds so any agent run can be re-played offline for debugging.
- **Partial-failure handling** — agents must serialize progress so a crash mid-workflow doesn't restart from scratch.
- **Agent-to-agent contracts** — multi-agent systems need typed message schemas (think: protobufs for prompts), not free-form English.
- **Human-escalation triggers** — explicit confidence thresholds, refusal patterns, and tool-error classes that route to a human review queue.

These are the things that make an agent demo into an agent product.

---

### Planning & reasoning loops

"Planning" in the mental model is not one thing — it's a **choice of control loop**. Each has a different reliability/cost profile. Know them by name; interviewers ask for them.

| Pattern | How it works | When to reach for it |
| --- | --- | --- |
| **ReAct** (reason + act) | Interleave a thought, a tool call, and an observation in a single loop until done | Default for tool-using agents. Simple, debuggable, good baseline. |
| **Plan-and-Execute** | LLM writes a full plan first, then a cheaper executor runs each step | Multi-step tasks where re-planning every turn is wasteful. Cuts cost by planning once. |
| **Reflexion / self-reflection** | Agent critiques its own output and retries with the critique in context | Tasks with a checkable failure signal (tests pass, schema valid, eval score). |
| **Tree-of-Thoughts / search** | Explore multiple reasoning branches, score, keep the best | High-value one-shot problems where exploration beats speed. Expensive. |
| **Router / dispatch** | A cheap classifier routes the request to the right tool, sub-agent, or skip-the-LLM path | High-volume production traffic where most requests are simple. |

**Rule of thumb:** start with ReAct + a good tool set. Only escalate to plan-and-execute or reflection when a single-loop agent measurably fails on your eval set — not before.

---

### Agent memory

The mental model lists "Memory" as one word; in practice it's an architecture with distinct stores and lifecycle policies.

| Type | Holds | Backed by |
| --- | --- | --- |
| **Short-term (working)** | Current-task scratchpad, recent turns, intermediate results | Context window + summary buffer |
| **Episodic** | Past interactions / runs — "what happened last time" | Vector store keyed by session/user |
| **Semantic** | Durable facts about the user, domain, or world | KV store or knowledge graph |
| **Procedural** | Learned skills / reusable tool sequences | Prompt library, skill registry |

- **Memory ≠ RAG.** RAG retrieves from a *corpus you own*; memory retrieves from *the agent's own history*. Same vector-DB machinery, different provenance and lifecycle.
- **Write/read/forget policies matter more than the store.** Decide what gets written (not every turn), how it's summarized, when it expires, and how forgetting propagates (GDPR right-to-be-forgotten — see [`compliance-governance.md`](../disciplines/compliance-governance.md)).
- **Context-window budgeting** is a memory decision: what to keep verbatim, what to summarize, what to page out to a store and retrieve on demand.

---

### Single-agent vs multi-agent — topologies and trade-offs

Reach for multi-agent **only after a single agent with good tools measurably fails.** Multi-agent multiplies cost, latency, and failure surface; it buys you separation of concerns and parallelism. The book's caution applies: most "multi-agent" needs are actually one agent with better tool descriptions.

| Topology | Shape | Strengths | Costs / risks |
| --- | --- | --- | --- |
| **Single agent + tools** | One loop, many tools | Simplest to build, debug, evaluate | Tool overload; one context holds everything |
| **Supervisor / orchestrator-worker** | A lead agent delegates to specialist workers | Clear ownership, easy to add specialists | Supervisor is a bottleneck + single point of failure |
| **Hierarchical** | Supervisors of supervisors | Scales to large task trees | Latency stacks; hard to trace end-to-end |
| **Sequential pipeline** | Fixed hand-off A→B→C | Predictable, cheap, easy to eval per stage | Not adaptive; a wrong early step poisons the rest |
| **Network / peer-to-peer** | Agents message each other freely | Maximum flexibility | Emergent loops, hardest to control and cost-cap |
| **Blackboard** | Agents read/write a shared state store | Decouples agents, good for parallel contributors | Needs strict schema + locking discipline |

**Design axis — loop economics.** Treat cost and latency as a *design-time* constraint, not just a runtime cap. An agent's spend is roughly `iterations × (growing context tokens) × tool round-trips`, and multi-agent multiplies this by the number of agents plus their inter-agent messages. Budget it before you build: pick the cheapest topology that passes your eval set, cap iterations, and prefer a router that skips the LLM entirely on easy traffic. This connects to the FinOps and latency work in Pillar 9.5.

Whatever topology you pick, the agent reliability engineering rules above still apply — and multi-agent adds one hard requirement: **typed agent-to-agent message contracts**, never free-form English between agents.

---

## Pillar 3 — MCP

This is becoming essential.

**Learn:**

- MCP Client
- MCP Server
- Tool Definitions
- Permissions
- Authentication

**Build:**

- SharePoint MCP
- PostgreSQL MCP
- CRM MCP
- Filesystem MCP

**Goal:** Understand:

```
Agent → MCP → Enterprise Tool
```

---

## Pillar 4 — Evaluation

Most people ignore this. Most companies desperately need it. **Evaluation infrastructure is a project in its own right** — build it once, reuse across all 3 flagships.

**Learn:**

- AI-as-a-Judge (and its pitfalls — judges hallucinate too)
- Evaluation datasets (golden sets, regression sets, adversarial sets)
- Functional correctness
- Hallucination testing
- Groundedness / faithfulness / citation accuracy
- Pairwise vs pointwise scoring
- Judge calibration against human labels

**Every project should contain:**

```
Prompt + Evaluation Dataset + Metrics
```

### Offline vs online evaluation

| Mode | What it answers | When it runs |
| --- | --- | --- |
| **Offline eval** | "Did this change break anything on my golden set?" | In CI, before merge. Like unit tests. |
| **Online eval** | "Is the production system actually working for real users?" | Continuously, on a sample of live traffic. |
| **A/B / canary** | "Is the new prompt/model statistically better than the old one?" | On release, with proper power analysis. |
| **Human eval** | "Do experts agree with what the system produced?" | Periodically, on hard or high-stakes samples — calibrates your judges. |

### Evaluating agents, not just outputs

The six numbers above evaluate an *answer*. An **agent** also has to be evaluated on *how it got there* — the trajectory. A wrong final answer and a right answer reached by a lucky wrong path are both failures.

| What to measure | Question it answers |
| --- | --- |
| **Task-completion rate** | Did the agent finish the goal, end-to-end? |
| **Trajectory / process correctness** | Was the *sequence* of steps and tool calls valid — not just the final output? |
| **Tool-selection accuracy** | Did it pick the right tool with the right arguments at each step? |
| **Step efficiency** | How many iterations / tool calls / tokens vs the optimal path? |
| **Recovery rate** | When a tool failed, did the agent recover instead of looping or giving up? |

- **Judge the trace, not only the answer.** Use an LLM-judge (or assertions) over the logged step sequence — this is where your observability traces (Pillar 5) and eval harness meet.
- **Golden trajectories.** For agent flagships, your golden set includes expected tool sequences, not just Q/A pairs.
- **This maps to reliability.** Trajectory eval is how you catch the loop/idempotency/recovery failures listed under agent reliability engineering (Pillar 2) *before* they reach production.

### What you must build

1. **A golden dataset per flagship** — 100–500 manually verified Q/A pairs, locked, versioned.
2. **A regression suite in CI** — every PR runs evals; failure blocks merge.
3. **A judge model + judge prompt** — versioned like code, calibrated against ~50 human-labelled samples per quarter.
4. **A dashboard of metrics over time** — groundedness, refusal rate, citation accuracy, p95 latency, cost per resolved query.
5. **An adversarial set** — prompt-injection attempts, jailbreaks, ambiguous queries, out-of-scope questions, factual traps.
6. **Eval drift detection** — when production traffic diverges from your eval set, alarm.

### Numbers you should publish in your portfolio

Real candidates show numbers; pretenders show screenshots. For each flagship, publish:

- Groundedness rate (%)
- Citation accuracy (%)
- Refusal rate on out-of-scope (%)
- p50 / p95 / p99 latency (ms)
- Cost per resolved query (€)
- Hallucination rate on adversarial set (%)

Those six numbers, with a methodology paragraph, beat any "I built a RAG" claim.

---

## Pillar 5 — Observability

The hidden differentiator.

**Learn:**

- OpenTelemetry
- Langfuse
- LangSmith
- Tracing
- Metrics
- Logs

**Track:**

- User
- Prompt
- Retrieved Docs
- Tool Calls
- Cost
- Latency

If something fails: **You know exactly why.**

---

## Pillar 6 — AI Governance

The future European moat.

**Learn:**

- AI Act
- GDPR
- Auditability
- Risk Management
- Human Oversight

**Every portfolio project should contain:**

- Approval Workflow
- Audit Logs
- Decision History

This immediately differentiates you.

---

## Pillar 6.5 — AI Security & Trust

Governance (Pillar 6) is about *being allowed* to ship. Security is about *not being breached* once you do. They are different. In 2026, **prompt injection is the #1 reason enterprise AI pilots stall** — and the candidate who can name the threats and the mitigations wins the job.

### Threat model — the OWASP LLM Top 10 you must know

| Threat | What it is | Mitigation in your stack |
| --- | --- | --- |
| **Prompt injection (direct)** | User overrides your system prompt with "ignore previous instructions" | System/user separation, input filters, structured outputs, refusal-tuning |
| **Indirect prompt injection** | Malicious instructions hidden in retrieved docs, web pages, emails, PDFs | Content sanitization at ingest, marker tokens around untrusted content, allowlist tools |
| **Jailbreaks** | Persuasion attacks that elicit forbidden behaviour | Output classifiers, red-team eval set, refusal calibration |
| **Sensitive data disclosure** | Model leaks training data, prompt secrets, or other users' data | Never put secrets in prompts; tenant isolation; output filters |
| **Insecure output handling** | LLM output executed as code / SQL / shell | Treat LLM output as untrusted input — parse, validate, escape |
| **Tool-use abuse / SSRF** | Agent tricked into hitting internal URLs, deleting data, exfiltrating | Tool-level allowlists, sandboxed runtime, idempotency, dry-run by default |
| **Model DoS / cost exhaustion** | Adversary drives token spend or latency to bankrupt you | Per-user rate limits, per-request token caps, budget alarms |
| **Supply-chain (model + data)** | Poisoned model weights, tampered embeddings, malicious fine-tune data | Cosign signing, SBOM, model provenance, hash-verified weights |
| **Training-data poisoning** | Adversary contaminates your fine-tune corpus | Provenance tracking, dataset hashing, eval on held-out adversarial set |
| **Excessive agency** | Agent has more permissions than the task needs | Principle of least privilege; per-tool, per-tenant scopes |

### PII and data governance pipeline

GDPR + AI Act compliance is operationalized in your pipeline, not in a policy doc:

- **PII detection at ingest** — Presidio / regex / NER classifier flags emails, names, IDs, health codes.
- **Redaction or tokenization** before embedding. Decide policy per corpus.
- **Encryption at rest** on the vector store. Most teams forget this.
- **Right-to-be-forgotten propagation** — deleting a source must delete every chunk + embedding + cached answer derived from it. Build this *before* you have customers.
- **Data residency** — embeddings can carry semantic content of regulated data; treat the vector DB as in-scope for residency rules.
- **Lineage** — every answer traces back to source doc + chunk + retrieval timestamp. This is your AI-Act / audit-trail superpower.

### Open-model licensing trap

Sovereign deployment ≠ free deployment. Each open model has a **license** with commercial restrictions:

- **Llama community license** — has acceptable-use clauses and a 700M-MAU trigger.
- **Qwen** — Apache-2 on most variants, but check tokenizer/data licenses.
- **Mistral / DeepSeek / Gemma** — each carries its own terms; commercial use varies.
- **AI Act provider vs deployer** — if you fine-tune significantly, you may become the *provider* of a new model with full compliance obligations. Know which side of the line each project sits on.

Maintain a one-line license note per model you ship. Lawyers will ask.

### What this looks like in your projects

- **Project 1 (Knowledge Platform):** content sanitization + marker tokens around retrieved chunks + output classifier.
- **Project 2 (Workflow Automation):** sandboxed tool runtime + per-tool allowlist + dry-run mode + idempotency keys.
- **Project 3 (Insurance Copilot):** full PII pipeline + encrypted vector store + lineage trail + Cosign-signed model containers + provider/deployer classification.

A demo without these is a demo. A system with these is sellable to a regulated buyer.

---

## Pillar 7 — Enterprise Architecture

**Understand:**

```
Users
  ↓
Frontend
  ↓
Backend
  ↓
Agents
  ↓
MCP
  ↓
Business Systems  (incl. structured stores + knowledge graphs)
  ↓
Models
```

Not:

```
Frontend → GPT
```

### Structured + unstructured retrieval

Vector DBs cover unstructured text. Real enterprises also have **structured** data — SQL warehouses, knowledge graphs (Neo4j, GraphDB, Stardog), entity stores. The 2026 frontier is combining both: vector for fuzzy recall, graph/SQL for precise multi-hop joins. For Project 3 (Insurance), a knowledge graph of policy ↔ claim ↔ claimant ↔ history beats a flat vector index every time.

### Voice / real-time as a product surface

Voice agents (sub-500ms round-trip) are a fast-growing market category — call centres, field-service copilots, in-car assistants. Different SLOs (first-token < 200ms, full-turn < 500ms), different stack (Whisper / Deepgram + streaming LLM + low-latency TTS). Worth one demo in your portfolio even if it isn't a flagship.

---

## Pillar 8 — Data Flywheel

This is where products become businesses.

**Learn:**

- User Feedback
- Correction Loops
- Dataset Generation
- Synthetic Data

**Architecture:**

```
Users
  ↓
Feedback
  ↓
Dataset
  ↓
Evaluation
  ↓
Improved System
```

---

## Pillar 9 — DevOps

You already like this area. Keep strengthening:

- Docker
- Kubernetes
- GitHub Actions
- Terraform / OpenTofu
- Azure (managed cloud path)
- Bare-metal GitOps (sovereign-cloud path — see below)
- Monitoring

**Target:** Deploy AI Systems Yourself, without relying on others — on managed cloud **and** on self-hosted enterprise platforms.

### Sovereign / On-Prem Deployment Track — `andrelair-platform` reference

Many real European customers (banks, insurers, healthcare, public sector, defence-adjacent SaaS) will **not** ship sensitive workloads to public LLM APIs or hyperscaler-managed services. They need AI deployed on infrastructure they own. This is a growing, higher-margin niche.

The `andrelair-platform` GitHub organisation is your concrete reference architecture for this track. It is a complete self-hosted enterprise platform — the on-prem equivalent of AWS/Azure/GCP — and every layer of it maps directly to skills you need anyway:

| Layer | Tooling (from andrelair-platform) | What it teaches you |
| --- | --- | --- |
| Bare-metal provisioning | MAAS, PXE boot, Ansible | How real enterprises bring up nodes without a cloud console |
| Orchestration | k3s | Lightweight Kubernetes for edge / on-prem |
| GitOps delivery | ArgoCD, `minicloud-gitops` repo | Reconciling cluster state from Git — the production deployment model |
| IaC | OpenTofu (Terraform), Crossplane | Codifying infra, including MAAS state |
| Load balancing / storage | MetalLB, Longhorn, NFS | The non-managed equivalents of ELB / EBS / EFS |
| Registry & supply chain | Harbor + Trivy, Cosign, SBOM | Image signing, vulnerability scanning — required under AI Act + NIS2 |
| Security | Keycloak (SSO/OIDC), OPA/Gatekeeper, Falco, Vault, kube-bench | Real enterprise auth, policy, runtime detection, secret management |
| Data layer | Redpanda, ClickHouse, dbt, Superset, OpenMetadata, Debezium | Event streaming + analytics + lineage — the data flywheel (Pillar 8) made concrete |
| Workflow | n8n, Temporal, Airflow, KEDA | Orchestration substrate for AI agents (Pillar 2) |
| Observability | Prometheus, Grafana, Loki, Jaeger | The infra side of Pillar 5 |
| Developer portal | Backstage | Self-service catalog — where your AI services get exposed |

**How to use it in this playbook:**

1. **Study, don't fork blindly.** Read `minicloud-platform-docs` end-to-end — it is your textbook for what a real on-prem stack contains.
2. **Mirror the pattern at small scale.** Stand up your own 1–3 node k3s + ArgoCD + Harbor + Keycloak + Longhorn lab. Doesn't have to be MAAS — a few VMs or refurbished mini-PCs are enough to prove the muscle.
3. **Deploy Project 3 here.** The Insurance / Compliance Copilot belongs on a sovereign stack, not Azure. That single architectural choice 10× its credibility for regulated-industry recruiters.
4. **Use the data layer for Pillar 8.** Redpanda → ClickHouse → dbt is a real data flywheel substrate. Wire your feedback / correction loops through it instead of inventing toy pipelines.
5. **Use Keycloak + OPA for governance.** Pillar 6's "approval workflow / audit log / decision history" maps to Keycloak (identity) + OPA (policy) + Loki (audit trail) on this stack — a defensible, demo-able answer to "how is this AI Act compliant?".
6. **Use Cosign + SBOM for AI supply chain.** Signed model containers + SBOM is what enterprises will start demanding for LLM workloads in 2026–2027. Get there first.

**Market angle this unlocks:**

> "I can deploy production AI systems on sovereign / on-prem infrastructure — not just managed cloud."

This positions you for clients that the typical "I deployed a RAG on Azure OpenAI" candidate cannot serve: regulated industries, EU sovereignty mandates, on-prem-only enterprise IT. Smaller talent pool, higher day rate, harder to displace.

---

## Pillar 9.5 — Production Operations

DevOps (Pillar 9) deploys the system. **Production Operations keeps it alive, fast, cheap, and trustworthy.** This is the gap between "I shipped a RAG" and "I run a RAG SLO'd to 99.5% groundedness at €0.04 per resolved query."

### Cost engineering & FinOps for AI

In 2026 the CFO question is no longer *"does it work?"* — it's *"what does it cost per resolved query?"* You must engineer cost like you engineer latency.

**Levers, in order of impact:**

1. **Model cascade routing** — cheap model first, escalate to expensive only on low-confidence. 60–90% cost reduction is normal.
2. **Prompt caching** — cache the system prompt + corpus context across requests (Anthropic, OpenAI, vLLM all support it). Up to 90% input-token cost cut.
3. **Semantic caching** — cache *answers* keyed by embedding similarity, not exact match. Huge win on FAQ-like traffic.
4. **KV-cache reuse** — on self-hosted inference, reuse KV cache across requests with shared prefixes (vLLM, SGLang).
5. **Batch API usage** — async, non-realtime jobs go to batch endpoints at ~50% cost.
6. **Context-window economics** — long contexts cost quadratically in some setups; chunk aggressively, retrieve precisely.
7. **Quantization** — GGUF / AWQ / GPTQ for self-hosted models cuts VRAM 2–4× with minimal quality loss.
8. **Smaller model + better retrieval** — SLM + great RAG often beats Frontier + mediocre RAG, at 1/20th the cost.
9. **Agent loop economics** — for agentic features, cost is `iterations × growing-context tokens × tool round-trips`, multiplied again in multi-agent setups by the number of agents and their messages. Cap iterations, prefer the cheapest topology that passes eval (see Pillar 2), and route easy traffic past the LLM entirely.

**Disciplines to build:**
- Per-feature unit economics dashboard (€ per query, by feature).
- Token accounting in every trace.
- Cache-hit-rate as a first-class metric.
- Budget guardrails: per-user, per-tenant, per-feature, with hard kill.

### Latency & inference engineering

Especially critical for the sovereign track — you're choosing the runtime, not calling an API.

- **Inference servers:** vLLM (default), TGI, SGLang, llama.cpp (edge), TensorRT-LLM (NVIDIA-optimized).
- **Parallelism:** tensor parallel (split layers across GPUs) vs pipeline parallel vs data parallel — know when each helps.
- **Speculative decoding** — small draft model proposes tokens, big model verifies. 2–3× speedup.
- **Continuous batching** — vLLM's default; non-negotiable for throughput.
- **Streaming** — first-token latency is what users feel. Stream tokens; don't wait for completion.
- **GPU utilization monitoring** — under-utilized GPUs are pure burn.
- **Context economics** — 100K-token prompts cost 100× a 1K-token prompt; design retrieval to keep context tight.

### SLOs for AI systems

You can't ship to enterprise without SLOs. For each flagship, publish:

| SLO | Typical target |
| --- | --- |
| **p95 end-to-end latency** | < 3s for chat, < 800ms for voice |
| **First-token latency** | < 500ms |
| **Groundedness rate** | > 95% (Project 3 should be > 98%) |
| **Refusal rate on out-of-scope** | > 90% |
| **Cost per resolved query** | < €0.05 (target depends on use case) |
| **Availability** | 99.5% in year 1, 99.9% with maturity |
| **Error budget** | 0.5% — tracked monthly |

### Release engineering for prompts and models

Prompts and models are code. Treat them like code.

- **Prompt versioning** — every prompt in Git, semver'd, with eval results attached.
- **Prompt registry** — runtime fetches versioned prompts; rollback is one config flip.
- **Canary releases** — 5% of traffic to the new prompt/model, watch metrics, ramp.
- **Feature flags for model routing** — toggle Frontier vs SLM per tenant or per cohort without redeploy.
- **Shadow mode** — new model runs alongside old, results compared offline; no user impact.
- **Rollback playbook** — one command to revert prompt + model + retrieval config to last green state.

### Incident response for AI

When a hallucination becomes a news story, the response process matters more than the bug. Build:

- **On-call runbook for AI-specific incidents:** mass hallucination, prompt-injection breach, cost spike, judge drift, embedding-index corruption, vendor outage.
- **Post-mortem template** — root cause categorized (prompt, retrieval, model, tool, data, infra).
- **Kill-switch per feature** — disable the AI feature, fall back to legacy UX, without a redeploy.

### Multi-tenancy (matters from Stage 3 → Stage 4)

The day you sell to your second customer, multi-tenancy becomes existential:

- **Per-tenant indexes** (or strong row-level filtering on a shared index).
- **Per-tenant prompts and config**.
- **Per-tenant cost accounting and budget caps**.
- **Tenant isolation at every layer** — auth, vector DB, cache, logs.
- **Per-tenant eval sets** — large customers want their own quality numbers.

### Frontend & product UX for AI

Your demos feel like Postman calls if you skip this. The UI is the product surface.

- **Streaming UI** — show tokens as they arrive; show retrieval state.
- **Citation rendering** — every claim links to the source chunk. Click to see the paragraph.
- **Confidence visualization** — show uncertainty (especially in Project 3).
- **Approval / diff UI for agent actions** — "Agent wants to send this email. Approve / Edit / Reject."
- **Structured-output rendering** — tables, forms, diffs, not walls of markdown.
- **Generative UI / artifacts** — for richer outputs (charts, docs, generated forms).
- **Error and refusal states** — explain *why* the system can't answer; offer next steps.
- **Undo** for agent writes.

These are what make a sale, not a model leaderboard score.

---

## Pillar 10 — Public Proof

This is currently the biggest gap.

**Build publicly.**

### GitHub
5–10 serious projects.

### LinkedIn

Post:

- Architecture
- Lessons Learned
- Evaluation Results

Not:

> I learned LangChain today

### Portfolio

For each project:

- Problem
- Architecture
- Evaluation
- Results (with the six numbers from Pillar 4)
- Lessons

### Community proof

Public commits aren't enough — buyers and recruiters look for signals of standing in the field.

- **One deep technical post per flagship** — architecture, eval numbers, what failed. 2,000+ words. Hosted on your own site or a known publication.
- **One OSS contribution** to a serious AI infra project (vLLM, LangGraph, Langfuse, llama.cpp, a vector DB, an MCP server). Not a typo fix — a real PR.
- **One meetup or conference talk** per year, even at a local Paris/Brussels AI meetup. Record it. Post it.
- **A consistent reading rhythm** — arXiv-sanity, Latent Space, Anthropic + Hugging Face + Mistral blogs, key researchers on X/LinkedIn. Skim weekly, deep-read monthly.

### Benchmarks you publish

For each flagship, publish a methodology page with:

- Corpus size + composition
- Eval set construction
- Groundedness / citation accuracy / refusal rate
- p50 / p95 / p99 latency
- Cost per resolved query
- Hallucination rate on adversarial set
- Compared against at least one baseline (e.g., raw Frontier with no RAG)

Numbers + methodology = the credibility shortcut.

---

## Corpus Sourcing — Where the Real Documents Come From

A RAG system that ingests **one PDF** is a tutorial. A RAG system that ingests **10,000 PDFs** across a real domain is a portfolio piece. This section is the bridge between "I built a demo" and "I built a production system."

### Why this matters

- Real systems must handle: multi-format ingestion (PDF, HTML, Markdown, DOCX), inconsistent structure, OCR'd scans, duplicates, multilingual content, and stale documents.
- Evaluation only becomes meaningful at **corpus scale** — hallucinations, retrieval drift, and groundedness failures are invisible on 1 document.
- Observability only earns its keep when there are thousands of queries hitting thousands of documents.
- Governance (Pillar 6) requires real source-tracking, licensing awareness, and audit trails — which only exist if your corpus is real.

### Free, high-volume document sources

#### Academic Papers & Research
- **arXiv** — AI, ML, Computer Science, Math (bulk API + S3 dumps available)
- **Google Scholar**
- **PubMed** — Medicine, Biology
- **SSRN** — Business, Economics, Law
- **DOAJ** — Directory of Open Access Journals

#### Books
- **Project Gutenberg** — 70,000+ free books
- **Internet Archive**
- **Open Library**

#### Government & Public Data
- **EU Publications Office** (great for AI Act / governance projects)
- **Data.gov**
- **World Bank Documents & Reports**
- **OECD Library**

#### AI, Software Engineering, Cloud, DevOps
- **GitHub** — documentation, RFCs, whitepapers, READMEs
- **Microsoft Learn**
- **AWS Documentation**
- **Kubernetes Documentation**
- **Apache Projects Documentation**

#### Business, Startups, Product Management
- **Y Combinator Library**
- **McKinsey Insights**
- **Bain Insights**
- **Harvard Business Review** (free articles)

### Finding hundreds of PDFs fast — Google operators

```
site:gov "artificial intelligence" filetype:pdf
site:edu "kubernetes" filetype:pdf
site:org "cybersecurity" filetype:pdf
"travel expense management" filetype:pdf
```

### Recommended starter corpora by flagship project

| Project | Sources | Realistic corpus size |
| --- | --- | --- |
| Enterprise Knowledge Platform | arXiv + AWS/Azure/Kubernetes docs + GitHub READMEs | 10,000+ documents |
| Workflow Automation Platform | Internal-style mock corpora + government PDFs + RFCs | 1,000–5,000 documents |
| Insurance / Compliance Copilot | EU Publications Office (AI Act, GDPR), insurance regulators, OECD | 2,000–10,000 documents |

### Ingestion pipeline you should actually build

```
Source Crawlers (arXiv, sitemaps, GitHub, gov portals)
   ↓
Normalizer (PDF/HTML/DOCX → clean Markdown + metadata)
   ↓
Deduplication + Language Detection
   ↓
Chunker + Embedder
   ↓
Vector Store + Metadata DB
   ↓
Evaluation Set Generator (sampled questions per source)
   ↓
RAG / Agent / MCP Layer
   ↓
Observability + Feedback Loop
```

This pipeline alone — built once, reused across all 3 flagship projects — is the single asset that proves you operate at production scale.

---

## Real-Case Project Catalog — Inspiration Source

Reference: [`ashishpatel26/500-AI-Agents-Projects`](https://github.com/ashishpatel26/500-AI-Agents-Projects).

Use this as your **expiration-proof idea bank** — concrete, industry-anchored agent project ideas that map directly to paying customers. Do **not** build all 500. Use it as a menu to:

1. Pick the **3 flagship projects** (below) — one per industry with the highest demand × your unique angle.
2. Keep a **short list of 5–10 "next-up" ideas** for when you finish a flagship and need a smaller demo to drive freelance traction.
3. Translate any of these from "agent demo" into "production AI system" by applying: corpus sourcing · evaluation · observability · governance · sovereign deployment.

### Industries covered (and which Playbook market category they hit)

| Industry | Sample real-case projects | Maps to market category |
| --- | --- | --- |
| Healthcare | Medical diagnostics assistant, Patient data monitoring, Claims automation, Medical report analysis | #6 Industry-Specific, #5 Knowledge Systems |
| Finance | Trading bot, Market analysis, Financial deep-dive analyzer, Investment recommender | #6 Industry-Specific |
| Insurance | Claims processing, Policy coverage analyzer, Risk assessment, Fraud detection | #6 Industry-Specific, #1 Enterprise Apps |
| Legal | Document review, Contract analysis, Legal clause highlighter, Compliance monitoring | #1 Enterprise Apps, #5 Knowledge Systems |
| HR | Recruitment recommender, Candidate matching, Performance reviews, Hiring pipeline | #1 Enterprise Apps |
| Sales & Marketing | Lead scoring, Product recommender, Marketing strategy, Email auto-responder, Pipeline analyzer | #2 Agents, #3 SaaS Features |
| Customer Support | 24/7 chatbot, Customer service agent, Query resolution, Multi-channel coordinator | #1 Enterprise Apps, #3 SaaS Features |
| Supply Chain & Logistics | Logistics optimizer, Route planning, Inventory mgmt, Delivery optimizer, Vendor performance | #2 Agents, #4 Infra |
| Manufacturing | Process monitoring, Quality control, Production line optimizer, Predictive maintenance | #6 Industry-Specific |
| Education | Virtual tutor, Personalized learning, Study partner, Research scholar, Course recommender | #6 Industry-Specific |
| Real Estate | Property pricing, Market trend analyzer, Investment scout, Property mgmt | #6 Industry-Specific |
| Cybersecurity | Threat detection, Red-team tester, Vulnerability assessment, Security posture | #4 Infra, #6 Industry-Specific |
| E-commerce & Retail | Personal shopper, Shopping partner, Demand forecaster | #3 SaaS Features |
| Entertainment & Media | Content personalization, Recommendation engines, Video analysis, Trend analysis | #3 SaaS Features |
| Hospitality & Travel | Virtual travel assistant, Itinerary planner, Listing search | #3 SaaS Features |
| Agriculture | Smart farming, Crop health monitor, Yield prediction | #6 Industry-Specific |
| Energy | Demand forecasting, Grid optimization | #4 Infra, #6 Industry-Specific |

### How to read this catalog without getting lost

- **Tutorials in that repo are starting points, not portfolios.** Almost all of them are single-PDF, single-tool, single-user demos. Your job is to take the *idea* and run it through the full Playbook stack (corpus → eval → observability → governance → deployment).
- **Pick one anchor industry.** Insurance/compliance is already your Project 3 — keep it. Then pick **one secondary industry** (likely Legal, Healthcare, or Finance) so you can transfer your patterns laterally during freelance Stage 2.
- **Avoid the saturated low-end.** Generic "24/7 chatbot" and "email auto-responder" are commoditized. Aim for projects with **document depth, regulatory weight, or workflow complexity** — those resist commoditization and pay better.

### "Next-up" shortlist (post-flagship freelance fodder)

Once your 3 flagships are live, these are the next demos to build — small, sellable, fast to ship:

- Contract Analysis + Clause Highlighter (Legal)
- Medical Report Analysis (Healthcare)
- Fraud Detection on transaction streams (Finance / Insurance)
- Vendor Performance Analyzer (Supply Chain)
- Predictive Maintenance copilot (Manufacturing)
- Recruitment / CV Matching Agent (HR)
- Security Posture Analyzer (Cybersecurity)

Each one is a **1–2 week build** if your flagship corpus pipeline, evaluation harness, and sovereign-deployment template are already in place. That reusability is the whole point of the 3-flagship strategy.

---

## Your Portfolio Ecosystem

Instead of 20 small projects: **Build 3 flagship systems.**

### Project 1 — Enterprise Knowledge Platform
Skills:
- RAG
- Evaluation
- Observability

Corpus: **10,000+ documents** from arXiv + AWS/Azure/Kubernetes docs + GitHub READMEs.

Market categories: **#1 Enterprise Applications**, **#5 Enterprise Knowledge Systems**.
Pains addressed: connecting AI to company data · making AI reliable · measuring ROI.

### Project 2 — Workflow Automation Platform
Skills:
- Agents
- MCP
- Human Approval

Corpus: **1,000–5,000 documents** — mixed internal-style mock corpora + government PDFs + RFCs.

Market categories: **#2 AI Agents & Workflow Automation**, **#4 Production AI Infrastructure**.
Pains addressed: integrating AI into business processes · automating repetitive work · controlling AI costs.

### Project 3 — Insurance / Compliance Copilot
Skills:
- AI Act
- Auditability
- Decision Support

Corpus: **2,000–10,000 documents** from the EU Publications Office, insurance regulators, OECD, GDPR/AI Act primary sources.

Market categories: **#6 Industry-Specific AI Products**, **#1 Enterprise Applications**.
Pains addressed: making AI reliable and secure · measuring ROI · regulatory integration.

Deployment target: **sovereign / on-prem stack** modelled on `andrelair-platform` (k3s + ArgoCD + Keycloak + OPA + Harbor + Cosign + Loki audit trail). This is the architecture regulated-industry buyers actually want.

---

## Monetization Path

### Stage 1 — Portfolio
No revenue goal.

### Stage 2 — Freelance AI Automation

Examples:

- Document Automation
- Knowledge Assistants
- Workflow Agents

**Target:** €300–€2000 projects.

**Idea pipeline:** draw from the [500-AI-Agents-Projects catalog](https://github.com/ashishpatel26/500-AI-Agents-Projects), but only pick ones you can **productionize in 1–2 weeks** by reusing your flagship infrastructure (corpus pipeline, eval harness, sovereign-deployment template). Prefer projects with document depth or regulatory weight over generic chatbots.

**Pricing strategy (not just a range):**

- **Value-based, not hourly.** Quote the business outcome (€ saved, hours reclaimed, deals closed), not your hours.
- **Discovery first, fixed scope after.** A paid 1–2 day "AI assessment" (€500–€1500) de-risks both sides and qualifies the buyer.
- **Retainers after the first project** — €1500–€4000/month for ongoing eval, prompt updates, model migrations. This is where freelance income compounds.
- **Never compete on price against generalists.** Compete on regulated-industry + sovereign deployment + published benchmarks. Those buyers don't shop on Upwork.

### Stage 3 — Productized Service

Example:

> AI Knowledge Assistant Setup for SMEs

Fixed price.

### Stage 4 — Micro-SaaS

Only after:

- Users
- Feedback
- Experience

---

## What I Would Ignore

Until 2027:

- Training LLMs from scratch
- Reinforcement Learning research
- Custom transformer architectures
- Chasing every new framework

---

## What I Would Obsess Over

- Building
- Shipping
- Evaluating
- Monitoring
- Improving

---

## Specialization — The T-Shape Decision

By 2027 you cannot be deep in Fullstack + Cloud + DevOps + AI + Governance + Sovereign deployment + Security + Inference Ops. That's 7 verticals. The market rewards specialists who are also competent generalists — a **T-shape**.

**Recommended deep stem:**

> **AI Systems Engineer for regulated industries on sovereign infrastructure.**

Reasoning:
- It is the **highest-margin, lowest-supply** corner of the AI labor market in Europe.
- It is **defensible** — generalist "I built a RAG on Azure OpenAI" candidates cannot compete here.
- It compounds with your alternance environment, the AI Act, your andrelair-platform reference, and Project 3.
- It produces the kind of buyer (banks, insurers, public sector) that pays retainers, not one-off invoices.

**Broad-but-shallow horizontal bar:** the other pillars stay competent — enough to architect, debug, and interview — but you stop trying to be best-in-class at them.

**Re-evaluate this decision once per year.** If the market shifts (e.g., a major hyperscaler dominates sovereign workloads, or open models stop improving), pivot the stem deliberately.

---

## Execution Plan — How You Actually Spend Each Week

Pillars are a map; cadence is what gets you there. From now → September 2027 is roughly **75 weeks**. Budget them.

### Weekly time allocation

| Activity | % | Notes |
| --- | --- | --- |
| **Flagship build** | 60% | Hands on keyboard, shipping code into one of the 3 flagships. |
| **Writing / public proof** | 15% | One LinkedIn post per week, one deep post per flagship. |
| **Targeted learning** | 15% | Specifically what unblocks this week's build — not random courses. |
| **Reading / research hygiene** | 10% | arXiv-sanity, Latent Space, vendor blogs, key researchers. |

### Definition of Done — per flagship

A flagship is *done* when it has, at minimum:

- A live, queryable deployment (sovereign for Project 3, managed for Projects 1 & 2).
- 10,000+ docs (or stated minimum) ingested through your pipeline.
- The six benchmark numbers published with methodology.
- A regression suite running in CI.
- A LinkedIn post + a deep technical writeup.
- One real user (could be a friend, a colleague, an alternance stakeholder) who has run > 50 queries.

No flagship counts as "shipped" until all six are true.

### 90-day rolling roadmap

Always maintain a 90-day plan with three columns: **building**, **writing**, **learning**. Review monthly. Anything older than 90 days that hasn't moved gets cut or rescoped.

### Quarterly checkpoints toward September 2027

| Quarter | Target state |
| --- | --- |
| **Q1** (next 3 months) | Pillar 1.5 + Pillar 4 + corpus pipeline v1. Project 1 alpha. First LinkedIn post. |
| **Q2** | Project 1 shipped (six numbers published). Sovereign lab running. Pillar 6.5 applied to Project 1. |
| **Q3** | Project 2 alpha. First OSS contribution. First meetup talk. |
| **Q4** | Project 2 shipped. Pricing strategy tested with one paid discovery. |
| **Q5** | Project 3 alpha on sovereign stack. AI Act + lineage trail working. |
| **Q6** | Project 3 shipped. First retainer client. |
| **Q7** (final ~3 months) | Polish, deep posts, talks, interviews. The North Star answer is rehearsed. |

### Ship-every-two-weeks rule

Every two weeks, **something must ship publicly** — a feature, a post, a benchmark update, a PR. If nothing shipped, the cadence has broken and the week's plan is wrong.

---

## Recruiter-Facing Assets

The playbook is the map. **These are the artifacts a recruiter or hiring manager actually sees.** Without them, the work is invisible. By September 2027, every item below exists, is current, and is reachable in under 60 seconds from a Google search of your name.

### The one-page portfolio site

A single URL — `firstname-lastname.dev` or equivalent — that loads fast and shows, in this order:

1. **Positioning sentence** (the North Star below). Above the fold.
2. **Three flagship cards.** Each card: one-line problem statement · architecture diagram thumbnail · the six benchmark numbers · link to deep writeup · link to live demo (or recorded demo if sovereign-only).
3. **One paragraph about you.** Who you are, what you build, who you build it for. No "passionate about AI."
4. **Contact.** Email + LinkedIn + GitHub + Calendly. Nothing else.

No carousel. No skills cloud. No emoji bullets. The numbers do the talking.

### Per-flagship deliverables (×3)

Each flagship ships with:

- **Live or live-recorded deployment** — public URL, or a 90-second screen-recorded demo on Loom/YouTube for the sovereign one.
- **Deep technical writeup** (2,000+ words) — problem, corpus, architecture, model choices with rationale, eval methodology, the six numbers, what failed, what you'd do differently.
- **Methodology page** — corpus composition, eval set construction, judge calibration, baselines compared. This is the credibility document.
- **Architecture diagram** — single image, exportable, that a senior engineer can read in 30 seconds.
- **GitHub repo** — clean README with the same six numbers at the top, a `make demo` that runs, a `make eval` that reproduces the benchmark, license declared.
- **One-pager case study** — PDF, two-column, for sending to prospects and recruiters who won't read 2,000 words.

### The 60-second demo video (×3)

A senior hiring manager scans, not reads. For each flagship, record a Loom under 60 seconds:

- 5 seconds: problem
- 15 seconds: architecture diagram on screen
- 30 seconds: live query, show citation, show latency, show cost
- 10 seconds: the six numbers as a card

Embed on the portfolio. Send in cold outreach. Re-record yearly.

### LinkedIn profile (the inbound surface)

This is where recruiters actually find you. Optimize ruthlessly:

- **Headline** — not "AI Enthusiast" or "Fullstack Developer learning AI." Something like:
  > *"AI Systems Engineer · Production RAG, agents, sovereign deployment for regulated industries · AI Act + GDPR"*
- **About section** — first 3 lines must contain: what you build, who for, with what proof (numbers + flagship names). Anything below the fold is bonus.
- **Featured section** — pin the three flagship writeups and the demo videos. Keep updated.
- **Experience entries** — for the alternance: lead with **outcomes** (what shipped, what improved, what numbers moved), not responsibilities.
- **Posting cadence** — one substantive post per week, framed as *"here's what I built / shipped / measured / failed at,"* not *"here's what I learned."*

### Recruiter-search keywords to land for

Make sure these phrases appear naturally in your portfolio, LinkedIn, and writeups so search picks you up:

- *AI Systems Engineer*
- *Production RAG / agentic systems / LangGraph*
- *AI Act / EU AI compliance / GDPR-compliant AI*
- *Sovereign AI / on-prem LLM / self-hosted inference*
- *LLM evaluation / groundedness / hallucination testing*
- *vLLM / Kubernetes / GitOps / ArgoCD*
- *MCP / tool calling / enterprise integration*
- Your sector (Insurance / Banking / Healthcare)

### Outbound assets

When you reach out — to clients, to recruiters, to hiring managers — these are ready:

- **Cold-email template** (3 sentences max): problem you solve · proof (one flagship + one number) · one-line CTA.
- **15-minute discovery script** — five questions you ask in the first call to qualify the buyer.
- **Reference architecture deck** — 8 slides, sovereign + managed variants, for clients who want to see how it fits their stack.
- **Pricing one-pager** — discovery → fixed-scope → retainer. Helps you avoid hourly-rate conversations.

### Definition of "recruiter-ready"

By September 2027, you are recruiter-ready when **all** of the following are true:

- Portfolio URL exists, loads in < 2s, mobile-friendly.
- Three flagships shipped with all per-flagship deliverables.
- Three 60-second demo videos live.
- LinkedIn headline + About + Featured rewritten per above.
- One published deep post per flagship (your site or external).
- One OSS contribution merged.
- One talk recorded.
- Six benchmark numbers visible on the portfolio homepage.

If any item is missing, you are not yet recruiter-ready — keep shipping.

---

## Interview Readiness — AI Systems Design Interviews

Shipping flagships gets you in the door. **System design interviews close the offer.** For senior / staff-track enterprise roles, the AI systems design interview is now its own category — distinct from classic distributed-systems interviews. Train for it deliberately.

### What enterprise AI design interviews actually test

Hiring managers in insurance, banking, healthcare, and SaaS evaluate four things, in this order:

1. **Problem framing** — can you turn a vague business ask into a measurable system?
2. **Architecture under constraints** — cost, latency, compliance, data residency, regulated traffic patterns.
3. **Trade-off reasoning** — why this model, why this retrieval, why this deployment, why *not* the alternatives.
4. **Production sense** — eval, observability, security, rollback, on-call. The boring real stuff.

A candidate who only talks about LangChain and Pinecone fails. A candidate who frames the problem, picks a model portfolio with reasoning, names the SLOs, and walks through eval + security + rollback **wins the offer**.

### The 7-step framework you walk every interview

Use the same structure for every AI design question. Interviewers grade *consistency*, not creativity.

1. **Clarify the problem** (2 min) — Who is the user? What's the business outcome? What's the volume (QPS, docs, tenants)? What are the failure modes the business cares about? What's the budget?
2. **Define SLOs upfront** (2 min) — p95 latency, groundedness target, cost per query, availability, refusal rate. Make them explicit before drawing anything.
3. **Sketch the data flow** (5 min) — User → Frontend → Backend → Retrieval (hybrid + rerank) → Model portfolio → Eval → Observability → Storage. Draw it on the whiteboard.
4. **Pick the model portfolio** (5 min) — Embedding + Reranker + Generator + Judge. State *which* and *why*. Frontier vs Open. Self-hosted vs API. Trade-offs out loud.
5. **Cover the data plane** (5 min) — Corpus sourcing, ingestion pipeline, chunking strategy, vector store choice, freshness SLO, PII handling, right-to-be-forgotten.
6. **Address the cross-cutting concerns** (10 min) — Eval (offline + online + adversarial), observability (traces, metrics, cost), security (OWASP LLM Top 10), governance (AI Act, lineage), cost engineering (cache, routing, batch), reliability (retries, idempotency, sandbox).
7. **Scale & evolve** (5 min) — How does this grow to 10× users? 100× docs? Multi-tenant? Multi-region? What's the migration path when models improve?

If you cover all seven calmly with numbers, you outperform 95% of candidates.

### Canonical interview questions you must be able to design live

Practice each one end-to-end. Time yourself: 35–40 min total per question.

1. **"Design an enterprise knowledge assistant for 50,000 employees over 10 million internal documents."**
2. **"Design a claims processing copilot for an insurer — must be AI-Act compliant and self-hosted."**
3. **"Design an agentic workflow that processes incoming invoices, validates them against POs, and routes for approval."**
4. **"Design a customer support copilot that handles 500 QPS with sub-2s p95 latency and < €0.03 per query."**
5. **"Design an internal code review agent that runs in CI and posts comments on PRs."**
6. **"Design a multi-tenant SaaS feature that lets each customer upload their own docs and query them — with strict tenant isolation."**
7. **"Design a voice agent for a call centre — sub-500ms first-token, with live PII redaction."**
8. **"Design a regulatory document Q&A system over 100k EU directives with full citation lineage."**
9. **"Design an eval and CI system that prevents prompt or model regressions from shipping."**
10. **"Migrate a production RAG from Frontier-only to a hybrid SLM + Frontier cascade — without quality regression."**

Each of these maps to a real flagship in your portfolio. **Your strongest interview move is to anchor the answer in something you actually built.**

### Trade-offs you must be able to defend out loud

Interviewers probe trade-offs. Have a 60-second answer ready for each:

- **Frontier API vs self-hosted open model** — cost, latency, compliance, customization, ops burden.
- **Dense vs hybrid retrieval** — recall, exact-match, code/IDs, cost.
- **Single big model vs model cascade** — cost vs simplicity, latency tail, eval complexity.
- **Long context vs RAG** — cost (quadratic), recall, freshness, citation.
- **Fine-tuning vs better RAG vs better prompting** — when each pays off, and what they don't fix.
- **Vector DB vs knowledge graph vs SQL** — fuzzy recall vs multi-hop vs precise joins.
- **Agentic vs scripted workflow** — when planning is worth the unreliability.
- **AI-as-a-judge vs human eval** — speed, calibration, cost, risk of judge drift.
- **Cloud-managed vs sovereign / on-prem** — compliance, cost, control, talent burden.
- **Stateless vs sticky sessions for multi-turn** — context cost, latency, complexity.

### Numbers you should have memorized

In a design interview, numbers signal seniority. Know these cold:

- Embedding dim sizes (768 / 1024 / 3072) and storage cost per million chunks.
- Frontier vs SLM cost per million tokens (input/output, current ranges).
- Prompt caching discount ranges (~50–90% off cached input).
- Typical p50/p95 first-token latency for streamed Frontier vs self-hosted vLLM.
- Vector DB QPS ceilings and rerank latency budget (~50–200ms for cross-encoder top-100).
- GPU VRAM ranges for 7B / 13B / 70B at FP16 / INT8 / INT4.
- Token budgets for typical context windows (8k, 32k, 128k, 1M).
- A reasonable "cost per resolved query" range for the use case (€0.001 → €0.10).

### Behavioral / system-design hybrid questions

Senior interviews mix design and behavioral. Prep STAR-format stories tied to your flagships:

- *"Tell me about a time you traded off quality for cost."* → cascade routing story from Project 1.
- *"Tell me about a hallucination incident you handled."* → adversarial eval set + rollback story.
- *"How did you convince a stakeholder to accept an AI feature?"* → AI Act lineage + audit trail demo from Project 3.
- *"What would you have done differently?"* → corpus pipeline refactor, evaluation gap, etc.

Every flagship should produce 2–3 of these stories. Write them down.

### How to train

- **Weekly:** one full mock design session, 45 min, talking aloud (record yourself).
- **Monthly:** one live mock with a senior engineer in your network or paid (€100–€200 well spent).
- **Continuously:** when you read a vendor architecture blog (Anthropic, OpenAI, Notion, Anthropic-customer case studies), re-design it in 20 minutes from the constraints.
- **Before any interview:** re-read this section + skim the relevant flagship writeup. Bring numbers.

### Interview-day rules

- **Drive the conversation.** Walk the 7-step framework even if not asked. Interviewers love structure.
- **State assumptions explicitly.** "I'll assume 100 QPS, 10M docs, EU-only data." Then design.
- **Numbers > vibes.** Every choice gets a number or a comparison.
- **Anchor to flagships.** "In Project 3 I solved this with X" beats hypothetical reasoning.
- **Name what you don't know.** Owning a gap is a senior signal; bluffing is a junior signal.

The candidate who walks this framework with their flagships as evidence does not get rejected. They get a counter-offer.

---

## The North Star

When a hiring manager or buyer asks *"What do you do?"*, you do not say:

> *"I can design and deploy production AI systems. RAG, Agents, MCP, Evaluation, Observability, Governance, Cloud, DevOps."*

That sentence is what every applicant says. It doesn't sell.

You say this instead:

> **"I build production AI systems for European regulated industries on sovereign infrastructure.**
>
> **Three live systems shipped — Enterprise Knowledge, Workflow Automation, Insurance/Compliance Copilot. AI-Act-grade audit lineage. Sub-3s p95 latency. ~€0.04 per resolved query. Self-hosted models with signed containers. Full evaluation methodology published.**
>
> **If you need an AI system a regulator can read, that's what I do."**

Specific. Defensible. Falsifiable (the numbers exist, on the portfolio, with methodology). Hard to copy without doing the work.

**That is the playbook to follow.** Ship the work. Publish the numbers. Sharpen the sentence. Let it pull recruiters in.
