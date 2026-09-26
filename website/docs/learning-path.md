---
id: learning-path
title: "Learning Path"
sidebar_position: 2
---

# Learning Path

A **staged, ordered route** through everything in this site — designed so each stage builds on the last, and every stage ends with a concrete thing you can *do* (not just "read"). Follow it top-to-bottom.

:::tip How to use this
- **Go in order.** Later stages assume the earlier ones. Skipping ahead works only if you already know that layer.
- **Build as you go.** The disciplines are reference; the *learning* happens when you apply a stage to a [flagship project](/projects). Read a stage → apply it to the current project → move on.
- **Prove each stage.** Every stage maps to rows in the [Mastery Checklist](/mastery-checklist). A stage isn't "done" when you've read it — it's done when you can produce that stage's proof artifact.
- **Re-audit quarterly.** Model selection, MCP, and agent patterns drift fastest — revisit them.
:::

---

## Stage 0 — Orientation *(before anything else)*

**Goal:** understand *what* an AI Systems Engineer for regulated European industries is, the market, and why the 10 disciplines exist.

| Read | Why |
|---|---|
| [Playbook](/playbook) | The whole roadmap — 10 pillars, market demand, monetization, interview bar. Read once end-to-end; it's the map for everything below. |

**Milestone:** you can state, in two sentences, the value proposition and which 3 pillars are your differentiators.

---

## Stage 1 — AI Core Foundations *(make the AI work)*

**Goal:** the skills that make an LLM system actually produce good, grounded answers. This is the heart — do it at **full depth**.

| Order | Discipline | What you'll be able to do |
|---|---|---|
| 1 | [Corpus Engineering](/disciplines/corpus-engineering) | Turn a messy document pile into a clean, chunked, deduplicated, retrievable corpus. |
| 2 | [Model Selection](/disciplines/model-selection) | Choose the right model for a task/budget/latency/sovereignty constraint — and defend it. |
| 3 | [LLMOps](/disciplines/llmops) | Version, test, release, and roll back prompts and models safely; control cost. |
| 4 | [MCP — Model Context Protocol](/disciplines/mcp) | Give models tools/context via MCP servers — the foundation for agents. |

**Prerequisite:** Stage 0. **Milestone:** a working hybrid-RAG pipeline with an eval suite — i.e., you're ready to start **[Project 1](/projects/project1-enterprise-knowledge-platform)**.

---

## Stage 2 — Platform & Delivery *(ship it and keep it running)*

**Goal:** take the AI system from "works on my machine" to "deploys reproducibly and stays up."

| Order | Discipline | What you'll be able to do |
|---|---|---|
| 5 | [CI/CD for AI Systems](/disciplines/cicd) | Build/test/scan/sign an AI service in a pipeline — including eval gates, not just unit tests. |
| 6 | [Kubernetes & GitOps](/disciplines/kubernetes-gitops) | Deploy and promote the system declaratively (Argo/Kargo), with environments as Git state. |
| 7 | [Reliability Engineering](/disciplines/reliability-engineering) | Set SLOs, handle failure/rollback, and run the thing under real traffic. |

**Prerequisite:** Stage 1. **Milestone:** the Stage-1 pipeline now deploys via GitOps with a canary + rollback — i.e., you're ready for **[Project 2](/projects/project2-workflow-automation-platform)** (agents + reliability become core).

---

## Stage 3 — Security & Governance *(the regulated-EU differentiator)*

**Goal:** the layer most engineers skip and regulated employers pay for — securing the system and making it auditable.

| Order | Discipline | What you'll be able to do |
|---|---|---|
| 8 | [Enterprise Security](/disciplines/enterprise-security) | Secrets, network policy, supply-chain (SBOM/signing), identity — the platform security baseline. |
| 9 | [AI Security & Red Teaming](/disciplines/ai-security-red-teaming) | Attack your own system (prompt injection, exfiltration, jailbreaks) and build the defenses. |
| 10 | [Compliance & Governance](/disciplines/compliance-governance) | AI-Act risk tiering, PII handling, audit lineage — make a system a regulator can read. |

**Prerequisite:** Stage 2. **Milestone:** a threat model + an AI-Act risk classification + audit-lineage design for your system — i.e., you're ready for **[Project 3](/projects/project3-insurance-compliance-copilot)** (full regulated stack).

---

## Stage 4 — Flagship Projects *(prove it — this is where learning sticks)*

**Goal:** apply the stages to three progressively harder builds. Each publishes [six benchmark numbers](/projects). Don't read-then-forget — *build these*.

| Order | Project | Applies | Adds |
|---|---|---|---|
| P1 | [Enterprise Knowledge Platform](/projects/project1-enterprise-knowledge-platform) | Stages 1–2 | 10k+ docs, hybrid RAG, eval CI, observability |
| P2 | [Workflow Automation Platform](/projects/project2-workflow-automation-platform) | + MCP, reliability | agent orchestration, human-in-the-loop, SLOs |
| P3 | [Insurance Compliance Copilot](/projects/project3-insurance-compliance-copilot) | + Stage 3 (all 10) | AI-Act compliance, PII pipeline, self-hosted models, signed containers, audit lineage |

**Milestone:** three shipped systems, each with its six benchmark numbers + methodology published.

---

## Stage 5 — Prove Mastery

**Goal:** honestly assess depth vs. breadth.

| Read | Why |
|---|---|
| [Mastery Checklist](/mastery-checklist) | For every pillar: the concrete *proof artifact* and *expert bar* that separates "I read it" from "I can build and defend it." |

**Milestone:** every pillar you claim has its proof artifact — ideally embodied in P1–P3.

---

## The path at a glance

```
Stage 0  Orientation ........... Playbook
Stage 1  AI Core Foundations ... Corpus → Model Selection → LLMOps → MCP        ──▶ build P1
Stage 2  Platform & Delivery ... CI/CD → Kubernetes/GitOps → Reliability         ──▶ build P2
Stage 3  Security & Governance . Enterprise Sec → AI Red-Team → Compliance       ──▶ build P3
Stage 4  Flagship Projects ..... P1 → P2 → P3   (apply the stages, publish numbers)
Stage 5  Prove Mastery ......... Mastery Checklist
```

> **Depth beats breadth.** Full depth on Stages 1 + 3 and one deployment track from Stage 2 — plus one flagship built well — beats shallow coverage of all ten disciplines.
