---
id: mastery-checklist
title: "Mastery Checklist"
sidebar_position: 4
---

# Mastery Checklist

**Reading a pillar ≠ mastering it.** You have *mastered* a pillar when you can point to a **shippable artifact** that you built and can defend under questioning — not when you can recite the table.

Each row below gives two things:

1. **Proof artifact** — the concrete thing that must exist (in a repo, a live deployment, or a writeup).
2. **Expert bar** — the number you can quote or the trade-off you can defend, unprompted, in an interview.

Rule: if you can't produce the artifact *and* clear the expert bar without notes, that pillar is still "read," not "mastered." The three flagship projects are where these artifacts should live — a single artifact often proves two or three pillars at once.

---

## Foundations

| Pillar | Proof artifact | Expert bar (defend without notes) |
|---|---|---|
| **1 — AI Foundations** | A written page: "Why RAG / Why Agents / Why LoRA / Why Eval / Why MCP" in your own words, no code | Explain each to a non-engineer in 2 sentences and to an engineer in 5 |
| **1.5 — Model Landscape** | A model-portfolio diagram for each flagship (which model does retrieval/rerank/reason/judge/generate) | Justify one specific model per role *and* why not the obvious alternative |

## Building the system

| Pillar | Proof artifact | Expert bar |
|---|---|---|
| **2 — Agents (retrieval)** | A retrieval pipeline using ≥3 techniques (hybrid + rerank + one advanced), with a before/after recall number | "80% of RAG failures are retrieval failures" — prove it with your own numbers |
| **2 — Agents (planning)** | One agent built two ways (ReAct + one of Plan-and-Execute / Reflexion), compared on the same eval set | Say when planning is worth the unreliability, with your data |
| **2 — Agents (memory)** | An agent with real short-term + long-term memory (a store, a write policy, an expiry/forget path) | Explain memory ≠ RAG and how right-to-be-forgotten propagates through it |
| **2 — Agents (multi-agent)** | One task solved single-agent, then a justified multi-agent version (name the topology) | Defend *why* you did/didn't go multi-agent, with cost + latency deltas |
| **2 — Agent reliability** | Budget caps + loop detection + idempotency keys + deterministic replay wired into a running agent | Show a replayed failed run being debugged offline |
| **3 — MCP** | ≥2 MCP servers you built (e.g. PostgreSQL + one enterprise tool), stdio and SSE | Explain stdio vs SSE and why tool-description quality drives tool selection |

## Proving the system works

| Pillar | Proof artifact | Expert bar |
|---|---|---|
| **4 — Evaluation** | A golden set (100–500 pairs) + a regression suite in CI that blocks merge + a calibrated judge | Show a PR that was blocked by an eval regression |
| **4 — Agent eval** | Trajectory/tool-selection eval over logged traces, not just final-answer eval | Distinguish a right answer from a right *path*, with a real example |
| **5 — Observability** | Live tracing (OpenTelemetry + Langfuse/LangSmith) with cost + token + latency per span | Pull up a real trace and walk its cost breakdown |

## Trust, safety, governance

| Pillar | Proof artifact | Expert bar |
|---|---|---|
| **6 — Governance** | An audit-log + approval + decision-history trail for one flagship (Keycloak + OPA + Loki pattern) | Answer "how is this AI Act compliant?" with the architecture, not a promise |
| **6.5 — Security** | An adversarial set + a red-team run (Garak/PyRIT) with mitigations mapped to OWASP LLM Top 10 | Name the top 3 threats to *your* system and how each is mitigated by layer |
| **7 — Enterprise architecture** | A full user→model architecture diagram for each flagship, incl. structured + unstructured retrieval | Draw it on a whiteboard in under 5 minutes |
| **8 — Data flywheel** | A feedback→correction→re-index loop that measurably improved a metric | Show the metric before/after the flywheel closed |

## Running it in production

| Pillar | Proof artifact | Expert bar |
|---|---|---|
| **9 — DevOps / deployment** | One flagship on managed cloud + one on sovereign/on-prem (k3s + ArgoCD + Harbor) | Explain why Project 3 belongs on sovereign infra, not Azure |
| **9.5 — Production ops** | An SLO + error budget + cost-per-resolved-query dashboard, with cascade routing or caching in place | Quote your € per query and the biggest lever that lowered it |
| **10 — Public proof** | Public portfolio: 3 live/recorded flagships, GitHub, benchmarks, the North Star LinkedIn headline | Hand over 3 URLs + 6 numbers per project on request |

---

## The final gate — you are the expert when all three are true

1. **All three flagships are live** (or live-recorded) with public URLs.
2. **Each publishes the six benchmark numbers** with a methodology paragraph:
   - Groundedness rate (%)
   - Citation accuracy (%)
   - Refusal rate on out-of-scope (%)
   - p50 / p95 / p99 latency (ms)
   - Cost per resolved query (€)
   - Hallucination rate on adversarial set (%)
3. **You can answer the 10 canonical interview questions** with trade-off reasoning — *why this model, why this retrieval, why this deployment, why not the alternatives.*

When those three hold, the North Star sentence is not a claim, it's a description:

> *I can design, build, deploy, secure, evaluate, monitor, and improve production AI systems.*

---

## How to use this file

- **Don't chase 100% breadth.** Depth on Pillars 2, 4, 5 + one deployment track beats shallow coverage of all ten.
- **One artifact, many pillars.** Building Project 2 well can tick agents, MCP, eval, observability, and ops at once. Build the flagships; the checkboxes fall out.
- **Re-audit quarterly.** The model landscape (1.5), MCP (3), and agent patterns (2) drift fastest — treat those rows as perishable.
