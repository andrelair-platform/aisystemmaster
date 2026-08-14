---
id: enterprise-security
title: "Enterprise Security"
sidebar_position: 9
---


## Scope

This covers the security concerns that appear in a regulated-industry production system beyond application-level AI security (see `ai-security-red-teaming.md`): identity and access management, secrets lifecycle, data loss prevention, penetration testing, dependency scanning, and vulnerability management.

---

## IAM — Identity and Access Management

### Architecture

Enterprise IAM is not just "add a login page." It is a complete identity plane that controls who can access what, under what conditions, with a full audit trail.

```
Enterprise IdP (Active Directory / Azure AD / Okta)
  ↓ SAML 2.0 or OIDC federation
Keycloak (self-hosted identity broker — required for Project 3)
  ↓ OIDC / OAuth 2.0
Applications, APIs, Kubernetes, Vault, ArgoCD, Langfuse
```

Keycloak is the trust anchor for the sovereign stack. Every service authenticates through it — no application manages its own user database.

### Keycloak setup for regulated deployments

```
Realms:
  rag-production/          ← production realm (isolated)
    Clients:
      rag-api              ← confidential client, client_credentials grant
      rag-frontend         ← public client, authorization_code + PKCE
      argocd               ← confidential client
      vault                ← JWT auth method
    Identity Providers:
      corporate-ad         ← SAML 2.0 federation with enterprise AD
    Roles:
      rag-user             ← can query the system
      rag-reviewer         ← can see retrieval details, approve/reject
      rag-admin            ← can manage corpus, prompts, users
      compliance-officer   ← can read audit logs, decision history
    Groups:
      underwriting-team    → rag-user + rag-reviewer
      it-admin             → rag-admin
      compliance           → compliance-officer
```

### RBAC at the application layer

Every API endpoint checks both authentication (who are you?) and authorization (are you allowed to do this?):

```python
from functools import wraps
from keycloak import KeycloakOpenID

keycloak = KeycloakOpenID(
    server_url="https://keycloak.internal/",
    realm_name="rag-production",
    client_id="rag-api",
    client_secret_key=settings.KEYCLOAK_SECRET,
)

def require_role(*roles):
    def decorator(f):
        @wraps(f)
        async def wrapped(request, *args, **kwargs):
            token = request.headers.get("Authorization", "").removeprefix("Bearer ")
            try:
                token_info = keycloak.introspect(token)
                if not token_info.get("active"):
                    raise HTTPException(401)
                user_roles = token_info.get("realm_access", {}).get("roles", [])
                if not any(r in user_roles for r in roles):
                    raise HTTPException(403)
                request.state.user_id = token_info["sub"]
                request.state.user_roles = user_roles
            except Exception:
                raise HTTPException(401)
            return await f(request, *args, **kwargs)
        return wrapped
    return decorator

@router.post("/query")
@require_role("rag-user", "rag-reviewer", "rag-admin")
async def query(request: Request, body: QueryRequest):
    ...

@router.get("/audit-logs")
@require_role("compliance-officer", "rag-admin")
async def get_audit_logs(request: Request):
    ...
```

### Multi-tenancy IAM

For SaaS or multi-client deployments (Project 2 in Stage 3+):

- Each tenant is a **Keycloak group** with a `tenant_id` claim injected into the JWT
- The application reads `tenant_id` from the token — never from the request body (user-supplied tenant IDs are a privilege escalation vector)
- Every database query is scoped: `WHERE tenant_id = :tenant_id` — never a raw query without the filter
- Vector DB: per-tenant collection or metadata filter enforced server-side

```python
# Tenant ID comes from the verified JWT, not from the request
tenant_id = request.state.token_claims["tenant_id"]
results = vector_db.query(query_vector, filter={"tenant_id": tenant_id})
```

### Service-to-service authentication

Services talk to each other using client credentials (machine identity), not shared passwords:

```python
# rag-api authenticating to rag-corpus-service
token_response = keycloak.token(
    grant_type="client_credentials",
    client_id="rag-api",
    client_secret=settings.KEYCLOAK_SECRET,
)
access_token = token_response["access_token"]
# access_token is a short-lived JWT (5–15 min) — fetch fresh on each request or cache until expiry
```

For Kubernetes pod-to-pod: use Kubernetes ServiceAccount tokens + OIDC binding to Keycloak. No static credentials between services.

---

## Secrets Lifecycle

### Principle: secrets have a lifecycle, not a birthdate

Most breaches involving secrets happen because a secret was created once and never rotated. Treat secrets as ephemeral by default.

```
Create → Store → Distribute → Use → Rotate → Revoke → Delete
```

### Secret categories and rotation schedules

| Secret type | Storage | Rotation cadence | Auto-rotate? |
|---|---|---|---|
| LLM API keys (OpenAI, Anthropic) | Vault | 90 days | No — vendor-managed |
| Database credentials | Vault + dynamic secrets | 24 hours (dynamic) | Yes — Vault generates |
| Internal service client secrets | Keycloak | 30 days | Semi (Keycloak rotation) |
| JWT signing keys | Keycloak (managed) | 90 days | Yes — Keycloak handles |
| TLS certificates | cert-manager (Let's Encrypt or internal CA) | 60–90 days before expiry | Yes — cert-manager |
| Encryption keys (at-rest) | Vault Transit | Annually | Semi-auto |
| GitHub Actions secrets | GitHub Secrets | 90 days | No — calendar reminder |
| SSH keys (server access) | Vault SSH CA | Per-session (ephemeral) | Yes |

### Vault dynamic secrets (databases)

Instead of a static password, Vault generates a short-lived credential for each pod startup:

```hcl
# Vault database secret engine config
path "database/roles/rag-api" {
  db_name = "rag-production-postgres"
  creation_statements = [
    "CREATE USER \"{{name}}\" WITH PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';",
    "GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA rag TO \"{{name}}\";"
  ]
  default_ttl = "1h"
  max_ttl = "24h"
}
```

The pod gets a database credential valid for 1 hour. Vault auto-renews while the pod lives. When the pod dies, the credential expires. No static database password exists.

### Secret rotation without downtime

For services that must keep running during rotation:

1. **Dual-credential window:** create new credential → deploy with new credential → verify → revoke old credential
2. **Application-side:** read credential from Vault at startup and refresh before expiry (not only at startup)
3. **Kubernetes:** use the External Secrets Operator to sync Vault secrets to Kubernetes Secrets; set a `refreshInterval: 1h`

### Secret scanning in CI

```yaml
# .github/workflows/secret-scan.yml
- name: Scan for secrets in code
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event.repository.default_branch }}
    head: HEAD
    extra_args: --only-verified
```

Also configure pre-commit hook:
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/trufflesecurity/trufflehog
    rev: v3.x.x
    hooks:
      - id: trufflehog
        args: ["git", "file://.", "--since-commit", "HEAD", "--only-verified", "--fail"]
```

Secrets in code are a P0 incident. Rotate immediately, assume compromised.

---

## Data Loss Prevention (DLP)

### What DLP covers for AI systems

DLP for AI systems has two planes:
- **Inbound DLP:** what data goes into the model (user queries, retrieved content)
- **Outbound DLP:** what data comes out of the model (responses that might contain PII, confidential data)

### PII classification taxonomy

| Class | Examples | Handling |
|---|---|---|
| **C1 — Public** | Published regulatory text, public documentation | Index freely |
| **C2 — Internal** | Internal policies, process docs | Restricted access, no external API calls |
| **C3 — Confidential** | Customer data, financial data, employee records | Per-tenant isolation, encrypted at rest and in transit |
| **C4 — Restricted** | Health records, biometric, legal privilege | Separate index, explicit consent, audit every access |

Tag every document at ingest with its classification. Classification propagates to all derived chunks and embeddings.

### Inbound DLP — query scanning

```python
import presidio_analyzer

analyzer = presidio_analyzer.AnalyzerEngine()

def scan_query(query: str, tenant_config: TenantConfig) -> ScanResult:
    results = analyzer.analyze(text=query, language="fr")  # or "en"
    pii_found = [r for r in results if r.score > 0.8]

    if pii_found and tenant_config.block_pii_in_queries:
        raise DLPViolation(
            "Query contains PII. Remove personal data before querying.",
            entities=[r.entity_type for r in pii_found]
        )

    if pii_found:
        # Log for compliance, but allow
        audit_log.write(event="pii_in_query", user_id=..., entities=[...])

    return ScanResult(pii_found=pii_found, allowed=True)
```

### Outbound DLP — response scanning

```python
def scan_response(response: str, classification: str) -> str:
    if classification in ("C3", "C4"):
        # Redact any PII that appears in the response
        results = analyzer.analyze(text=response, language="fr")
        anonymized = anonymizer.anonymize(text=response, analyzer_results=results)
        return anonymized.text
    return response
```

For C4 data: responses are not cached and not logged in full — only a hash of the response is stored for audit purposes.

### Egress controls

In regulated environments (Project 3), outbound HTTP from AI components is blocked by default:

```yaml
# Kubernetes NetworkPolicy: allow only approved egress destinations
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: rag-api-egress
  namespace: rag-production
spec:
  podSelector:
    matchLabels: {app: rag-api}
  policyTypes: [Egress]
  egress:
    - to:
        - namespaceSelector:
            matchLabels: {name: vector-db}
      ports: [{port: 6333}]
    - to:
        - namespaceSelector:
            matchLabels: {name: keycloak}
      ports: [{port: 443}]
    # No egress to the internet — LLM must be self-hosted
```

No external API calls from components that handle C3/C4 data.

---

## Penetration Testing

### Program structure

| Test type | Scope | Cadence | Who |
|---|---|---|---|
| **Internal red team** | Prompt injection, tool abuse, tenant escape | Every major release | Developer not on the feature |
| **Automated scan** | OWASP Top 10, dependency CVEs, secret exposure | Every PR (CI) | Garak, Trivy, TruffleHog |
| **External pentest** | Full application + infra | Annually, before each major regulated deployment | Specialist firm |
| **Social engineering** | Phishing, credential theft | Annually | External firm |
| **Physical (for on-prem)** | Server room access, hardware | Annually | External firm (Project 3 if servers are on-site) |

### External pentest scope document

```markdown
## Pentest Scope — RAG Platform v2.0

### In scope
- Web application: https://rag.company.internal (staging clone)
- API endpoints: /query, /admin/*, /audit/*
- Authentication: Keycloak OIDC flows
- MCP servers: policy-mcp, claims-mcp
- Network: 10.10.0.0/24 (staging subnet)

### Out of scope
- Production environment (test on staging clone)
- Third-party services (Keycloak upstream, PostgreSQL upstream bugs)
- Denial of service testing

### Test types authorized
- Web application testing (OWASP Top 10)
- API testing (injection, auth bypass, rate limiting)
- AI-specific testing (prompt injection, indirect injection, jailbreaks)
- Internal network pivoting from compromised app server
- Credential stuffing (against staging accounts only)

### Rules of engagement
- No destructive actions (no data deletion, no DoS)
- Findings reported within 48h of discovery if critical
- Test window: 2026-09-01 to 2026-09-14

### Contacts
- Technical lead: [name + phone]
- Emergency stop: [name + phone]
```

### Remediation SLAs by severity

| CVSS score | Severity | Remediation SLA |
|---|---|---|
| 9.0–10.0 | Critical | 24 hours — patch or take offline |
| 7.0–8.9 | High | 7 days |
| 4.0–6.9 | Medium | 30 days |
| 0.1–3.9 | Low | 90 days |
| 0 | Informational | Next release cycle |

Track in a vulnerability register (Linear ticket or Jira, labeled `security`). Critical findings block deployment.

---

## Dependency Scanning and Vulnerability Management

### Tools

| Tool | What it scans | When it runs |
|---|---|---|
| **Trivy** | Container images, filesystem, SBOM | CI on every build + weekly scheduled scan of registry |
| **Dependabot** | Python/JS/Go package CVEs | Automatic PRs on vulnerable dependency |
| **OSV Scanner** | Cross-ecosystem CVEs (PyPI, npm, Go) | CI pipeline |
| **pip-audit** | Python packages specifically | Pre-commit + CI |
| **Snyk** (optional) | Code, containers, IaC | CI (if budget permits) |

### CI integration

```yaml
# In the CI pipeline (after build stage)
  dependency-scan:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Scan container image with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/org/rag-api:${{ github.sha }}
          format: sarif
          output: trivy-results.sarif
          severity: CRITICAL,HIGH
          exit-code: 1          # fail CI on CRITICAL or HIGH CVEs

      - name: Upload results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-results.sarif

      - name: Audit Python dependencies
        run: pip-audit -r requirements.txt --format json -o pip-audit.json

      - name: OSV scan
        uses: google/osv-scanner-action@v1
        with:
          scan-args: |-
            --lockfile=requirements.txt
            --lockfile=package-lock.json
```

### SBOM generation and signing (Project 3 — AI supply chain)

```bash
# Generate SBOM for the container image
syft ghcr.io/org/rag-api:$SHA -o spdx-json > sbom.spdx.json

# Sign the image with Cosign
cosign sign --key cosign.key ghcr.io/org/rag-api:$SHA

# Attach the SBOM to the image
cosign attach sbom --sbom sbom.spdx.json ghcr.io/org/rag-api:$SHA

# Sign the SBOM attachment
cosign sign --key cosign.key --attachment sbom ghcr.io/org/rag-api:$SHA
```

At deployment time, verify before pulling:
```bash
cosign verify --key cosign.pub ghcr.io/org/rag-api:$SHA
```

### Vulnerability register

Track every known vulnerability in a register:

```markdown
| ID | CVE | Severity | Component | Discovered | SLA | Status | Owner |
|----|-----|----------|-----------|------------|-----|--------|-------|
| VUL-001 | CVE-2025-XXXX | High | requests==2.28.0 | 2026-08-01 | 2026-08-08 | Fixed in PR#42 | @dev |
| VUL-002 | CVE-2025-YYYY | Medium | cryptography==41.0 | 2026-08-05 | 2026-09-04 | In progress | @dev |
```

Reviewed weekly. Any CVE past its SLA escalates to the security lead.

### Model weight integrity (Project 3)

Open model weights can be tampered with. Verify at load time:

```python
import hashlib

EXPECTED_HASHES = {
    "model.safetensors": "sha256:abc123...",
    "config.json": "sha256:def456...",
}

def verify_model_weights(model_dir: Path):
    for filename, expected_hash in EXPECTED_HASHES.items():
        actual = hashlib.sha256((model_dir / filename).read_bytes()).hexdigest()
        if f"sha256:{actual}" != expected_hash:
            raise SecurityError(f"Model weight integrity check failed: {filename}")
```

Hash values sourced from the official model release and stored in Vault (not in the application code).
