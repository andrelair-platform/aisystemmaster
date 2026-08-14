# aisystemmaster

[![Docs](https://github.com/andrelair-platform/aisystemmaster/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/andrelair-platform/aisystemmaster/actions/workflows/deploy-docs.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Personal roadmap and reference library for becoming an AI Systems Engineer for regulated European industries by September 2027. Covers 10 engineering disciplines, 3 flagship project blueprints, and a production-readiness methodology applied to the `andrelair-platform` sovereign Kubernetes stack.

**Live docs:** https://andrelair-platform.github.io/aisystemmaster/

**Platform docs:** https://andrelair-platform.github.io/minicloud-platform-docs/

---

## What's here

| Directory | Content |
|---|---|
| `AI_Systems_Engineer_Playbook.md` | Master career roadmap — 10 pillars, market demand, interview readiness, monetization path |
| `corpus-engineering.md` | Acquisition, OCR, chunking, deduplication, delta indexing |
| `model-selection.md` | 12 model categories, decision framework, trade-off matrix |
| `llmops.md` | Prompt versioning, canary releases, inference servers, cost engineering |
| `ai-security-red-teaming.md` | OWASP LLM Top 10, attack taxonomy, Garak/PyRIT, mitigation by layer |
| `mcp.md` | stdio vs SSE transports, tool schemas, auth patterns |
| `cicd.md` | GitHub Actions AI pipeline, eval in CI, Docker, golden sets |
| `kubernetes-gitops.md` | ArgoCD App-of-Apps, Kustomize, GPU scheduling, k3s sovereign |
| `enterprise-security.md` | IAM, multi-tenant RBAC, Vault dynamic secrets, DLP, Cosign/SBOM |
| `reliability-engineering.md` | HA patterns, DR runbook, SLO/SLA, incident management |
| `compliance-governance.md` | DPIA, AI Act, data retention, audit log architecture |
| `project1-enterprise-knowledge-platform.md` | RAG at scale, eval CI, observability |
| `project2-workflow-automation-platform.md` | Agent orchestration, MCP, human-in-the-loop |
| `project3-insurance-compliance-copilot.md` | Sovereign stack, AI Act controls, audit lineage |
| `website/` | Docusaurus 3.10.0 — published to GitHub Pages |

## The six benchmark numbers

Every flagship project publishes these with full methodology:

1. Groundedness rate (%)
2. Citation accuracy (%)
3. Refusal rate on out-of-scope (%)
4. p50 / p95 / p99 latency (ms)
5. Cost per resolved query (€)
6. Hallucination rate on adversarial set (%)

## Platform

Projects run on [`andrelair-platform`](https://github.com/andrelair-platform) — a 5-node bare-metal Kubernetes cluster (k3s + ArgoCD + Harbor + Vault + Authentik + Longhorn) simulating the IS of a French B2B insurer.

## License

MIT — André Kanmegne
