---
id: intro
slug: /
title: AI Systems Master
sidebar_position: 1
---

# AI Systems Master

Personal roadmap and reference library for becoming an **AI Systems Engineer for regulated European industries** by September 2027.

> *"I build production AI systems for European regulated industries on sovereign infrastructure. AI-Act-grade audit lineage. Sub-3s p95 latency. ~€0.04 per resolved query. Self-hosted models with signed containers. If you need an AI system a regulator can read, that's what I do."*

---

## New here? Start with the Learning Path

👉 **[Learning Path](/learning-path)** — a staged, ordered route through everything below (Orientation → AI Core Foundations → Platform & Delivery → Security & Governance → Projects → Mastery). Follow it top-to-bottom; each stage builds on the last and ends with something you can *do*. The sections below are the reference material that path walks you through.

## What's here

| Section | Content |
|---|---|
| [Learning Path](/learning-path) | **Start here** — the recommended learning order across all disciplines + projects, in 6 stages |
| [Playbook](/playbook) | Master career roadmap — 10 pillars, market demand, monetization path, interview readiness |
| [Disciplines](/disciplines) | 10 deep-reference files, one per skill domain |
| [Projects](/projects) | 3 flagship project specs — implementation blueprints, corpus targets, eval methodology, six benchmark numbers |

---

## The three flagship projects

| Project | Domain | Differentiator |
|---|---|---|
| [Enterprise Knowledge Platform](/projects/project1-enterprise-knowledge-platform) | Any / cloud | 10k+ docs, hybrid RAG, eval CI, observability |
| [Workflow Automation Platform](/projects/project2-workflow-automation-platform) | Business workflows | Agents, MCP, human-in-the-loop, reliability engineering |
| [Insurance Compliance Copilot](/projects/project3-insurance-compliance-copilot) | Regulated / sovereign | AI Act, PII pipeline, self-hosted models, audit lineage, Cosign |

Project 3 runs on **minicloud** — the `andrelair-platform` sovereign Kubernetes stack.

---

## The six benchmark numbers

Every flagship publishes these, with methodology:

1. Groundedness rate (%)
2. Citation accuracy (%)
3. Refusal rate on out-of-scope (%)
4. p50 / p95 / p99 latency (ms)
5. Cost per resolved query (€)
6. Hallucination rate on adversarial set (%)

---

## Platform

Built on [`andrelair-platform`](https://github.com/andrelair-platform) — a 5-node bare-metal Kubernetes cluster (k3s + ArgoCD + Harbor + Vault + Authentik + Longhorn) simulating the IS of a French B2B insurer.

**Platform docs:** [andrelair-platform.github.io/minicloud-platform-docs](https://andrelair-platform.github.io/minicloud-platform-docs/)
