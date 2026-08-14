# Project 2 — Workflow Automation Platform

## Goal

Build a production agentic system with human-in-the-loop approval, MCP tool access, and audit logs — turning a business workflow into a reliable, controllable AI-driven process.

Market categories addressed: **#2 AI Agents & Workflow Automation**, **#4 Production AI Infrastructure**

Business pains addressed:
- Integrating AI into existing business processes
- Automating repetitive work
- Controlling AI costs

---

## Corpus

**Minimum:** 1,000–5,000 documents

**Sources:**
- Internal-style mock corpora (invoices, POs, approval records)
- Government PDFs
- RFCs and process documentation

---

## Architecture

```
User / Trigger (scheduled, webhook, or manual)
  ↓
Frontend (approval UI, diff view, undo)
  ↓
Orchestrator (LangGraph workflow)
  ↓
Planning Model (Reasoning)
  ↓
Tool Calls via MCP ─────────────────────────────┐
  ↓                                              │
Human-in-the-loop Gate (approve / edit / reject) │
  ↓                                              │
Synthesis Model (Frontier)                       │
  ↓                                              │
Audit Log + Observability ◄──────────────────────┘
```

**Agent reliability requirements (non-negotiable from day one):**
- Budget caps per run — max tokens, max tool calls, max wall-clock seconds; hard kill on overrun
- Loop detection — track repeated state hashes; escalate to human after N revisits
- Retries with exponential backoff — separate from LLM retries
- Idempotency keys on every tool call, especially writes — replay never double-acts
- Sandboxed tool runtime — agents touching filesystem, network, or business systems run in constrained scope
- Deterministic replay — log inputs, outputs, seeds for offline debugging
- Partial-failure handling — serialize progress so a crash mid-workflow doesn't restart from scratch
- Human-escalation triggers — explicit confidence thresholds and tool-error classes that route to human review

---

## Model Portfolio

| Role | Choice | Rationale |
|---|---|---|
| Planner | Reasoning model (DeepSeek-R1, OpenAI reasoning, Qwen Reasoning) | Multi-step workflow planning |
| Synthesizer | Frontier model | Final output generation |
| Tool executor | Code model (DeepSeek Coder, Qwen Coder) | Tool invocation, structured output |
| Judge | Cheaper capable model | Action correctness scoring |

---

## MCP Integration

Build and expose MCP servers for:
- Document store (invoices, POs, records)
- Approval workflow (approve / reject / escalate)
- Notification system (email, Slack)
- Audit log writer

Tool definitions must include:
- Typed schemas (no free-form English between agents)
- Per-tool permission scopes
- Dry-run mode for all write tools

---

## Human-in-the-Loop UI

Required screens:
- **Approval view** — "Agent wants to send this email. Approve / Edit / Reject."
- **Diff view** — show what the agent proposes to change vs current state
- **Undo** — revert the last agent write
- **Queue** — list of pending human decisions with SLA countdown

---

## Security

- Sandboxed tool runtime — agents run as least-privilege principal
- Per-tool allowlist — explicit set of permitted tools per workflow type
- Dry-run mode by default — agent proposes, human approves before execution
- Idempotency keys on all write operations

---

## Evaluation

**Offline eval (CI):**
- Golden dataset: 100–500 workflow executions with verified outcomes
- Regression suite on every PR

**Metrics to track:**
- Task completion rate
- False-escalation rate (agent escalates when it shouldn't)
- False-automation rate (agent acts when it should have escalated)
- Idempotency violation rate
- Cost per completed workflow

**Adversarial set:**
- Ambiguous inputs that should trigger human escalation
- Malicious tool-use attempts (SSRF-style inputs)
- Loops and circular dependencies

---

## Six Benchmark Numbers to Publish

| Metric | Target |
|---|---|
| Task completion rate | > 85% without human intervention |
| False-escalation rate | < 10% |
| False-automation rate | < 2% |
| p95 end-to-end workflow latency | < 30s |
| Cost per completed workflow | < €0.10 |
| Idempotency violation rate | 0% |

---

## SLOs

| SLO | Target |
|---|---|
| p95 workflow latency | < 30s |
| Availability | 99.5% |
| Human response SLA | Configurable per workflow (e.g., 4h) |

---

## Deployment

Managed cloud. CI/CD with GitHub Actions. Containerized with Docker, orchestrated via Kubernetes or equivalent.

---

## Definition of Done

- Live, triggerable deployment (webhook or UI)
- 1,000–5,000 documents ingested through the pipeline
- Six benchmark numbers published with methodology
- Regression suite running in CI
- LinkedIn post + deep technical writeup (2,000+ words)
- One real user who has run > 50 workflow executions

---

## Interview Anchor

> "Design an agentic workflow that processes incoming invoices, validates them against POs, and routes for approval."

This project is the live answer to that question. Lead with the reliability engineering (budget caps, idempotency, sandbox, escalation triggers) — that's what separates a demo from a product.

---

## Deliverables

- Live or recorded demo (90 seconds)
- Deep technical writeup: problem, corpus, architecture, model choices with rationale, reliability engineering, eval methodology, six numbers, what failed
- Methodology page: workflow types tested, eval set construction, baselines compared
- Architecture diagram (single image, readable in 30 seconds)
- GitHub repo: clean README with six numbers at top, `make demo`, `make eval`, license declared
- One-pager case study (PDF, two-column)
