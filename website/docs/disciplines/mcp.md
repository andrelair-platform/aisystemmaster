---
id: mcp
title: "MCP — Model Context Protocol"
sidebar_position: 6
---

## What MCP Is

MCP (Model Context Protocol) is an open standard that defines how AI agents connect to external tools, data sources, and services. Think of it as USB-C for AI: one protocol, many connectors.

Without MCP, every agent-to-tool integration is bespoke. With MCP, any MCP-aware agent can use any MCP server without custom glue code.

**The architecture:**

```
Host (Claude Desktop, your app, your agent runtime)
  ↓ MCP Client (embedded in the host)
  ↓ MCP Protocol (JSON-RPC 2.0)
  ↓ MCP Server (your tool/service)
  ↓ Underlying resource (filesystem, DB, API, CRM...)
```

One host can connect to multiple MCP servers simultaneously. One MCP server can serve multiple hosts.

---

## Core Concepts

### Resources

Expose data the model can read — documents, database rows, file contents. Resources are identified by URIs.

```json
{
  "uri": "file:///policies/POL-2024-001.pdf",
  "name": "Policy POL-2024-001",
  "mimeType": "application/pdf"
}
```

Resources are **read-only** by design. For mutations, use tools.

### Tools

Functions the model can call. Each tool has:
- A unique `name`
- A human-readable `description` (the model uses this to decide when to call it)
- An `inputSchema` (JSON Schema defining parameters)
- A return value (text, structured data, error)

```json
{
  "name": "get_policy_coverage",
  "description": "Retrieve coverage details for an insurance policy by policy ID. Returns coverage limits, exclusions, and effective dates.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "policy_id": {
        "type": "string",
        "description": "The policy identifier, e.g. POL-2024-001"
      },
      "as_of_date": {
        "type": "string",
        "format": "date",
        "description": "Optional. Check coverage as of this date (YYYY-MM-DD). Defaults to today."
      }
    },
    "required": ["policy_id"]
  }
}
```

**Tool description quality is critical.** The model reads the description to decide when to call the tool. Vague descriptions → wrong tool selection. Write descriptions as if explaining to a smart colleague who can't see the code.

### Prompts

Reusable prompt templates exposed by the server. The host can list available prompts and fill them with arguments. Useful for standardizing how agents invoke complex workflows.

---

## Transport Protocols

### stdio (standard input/output)

Used for **local servers** — server runs as a subprocess of the host.

```
Host process
  │  stdin/stdout
  └─→ MCP Server process (subprocess)
```

```python
# Client launches server as subprocess
server = subprocess.Popen(
    ["python", "my_mcp_server.py"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE
)
```

**When to use:** local development, CLI tools, servers that must run on the same machine as the host (filesystem access, local DB).

**Limitations:** one server per subprocess, no network access, harder to scale.

### SSE (Server-Sent Events) over HTTP

Used for **remote servers** — server runs as an HTTP service.

```
Host process
  │  HTTP + SSE
  └─→ MCP Server (HTTP service, any machine)
```

The server exposes two endpoints:
- `POST /mcp` — client sends JSON-RPC requests
- `GET /mcp/sse` — server pushes events to client

**When to use:** production deployments, servers shared across multiple hosts, servers that need their own scaling, enterprise integrations (CRM, ERP, SharePoint).

**Advantages:** network-accessible, independently scalable, supports authentication headers, deployable as a container.

### Choosing stdio vs SSE

| Criterion | stdio | SSE |
|---|---|---|
| Deployment | Same machine as host | Independent service |
| Authentication | Process-level (OS permissions) | HTTP headers (API key, OAuth) |
| Scaling | One process per host | Horizontally scalable |
| Development | Simpler | Slightly more setup |
| Production use | Local tools only | All shared/enterprise tools |

In the flagship projects: **stdio for local dev, SSE for production**.

---

## Building an MCP Server (Python)

### Minimal server with the MCP SDK

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types

app = Server("insurance-policy-server")

@app.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="get_policy_coverage",
            description="Retrieve coverage details for an insurance policy by policy ID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "policy_id": {"type": "string", "description": "Policy identifier"}
                },
                "required": ["policy_id"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "get_policy_coverage":
        policy_id = arguments["policy_id"]
        coverage = await db.get_policy(policy_id)  # your business logic
        return [types.TextContent(type="text", text=json.dumps(coverage))]
    raise ValueError(f"Unknown tool: {name}")

# Run with stdio transport
async def main():
    async with stdio_server() as streams:
        await app.run(*streams, app.create_initialization_options())

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### SSE server (FastAPI + MCP)

```python
from fastapi import FastAPI
from mcp.server.sse import SseServerTransport

fastapi_app = FastAPI()
transport = SseServerTransport("/mcp/sse")

@fastapi_app.get("/mcp/sse")
async def sse_endpoint(request: Request):
    async with transport.connect_sse(request.scope, request.receive, request._send) as streams:
        await app.run(*streams, app.create_initialization_options())

@fastapi_app.post("/mcp")
async def handle_post(request: Request):
    # Handle non-SSE JSON-RPC requests
    ...
```

---

## Authentication

### API key (simplest, for internal services)

```python
# Server-side validation
@fastapi_app.middleware("http")
async def verify_api_key(request: Request, call_next):
    api_key = request.headers.get("X-API-Key")
    if api_key != settings.MCP_API_KEY:
        return Response(status_code=401)
    return await call_next(request)
```

Client passes: `"X-API-Key": "<key>"` in HTTP headers.

### OAuth 2.0 (for user-delegated permissions)

When the MCP server acts on behalf of a user (e.g., reading their SharePoint, their CRM):

```
Host → MCP Server: "I need access to user's SharePoint"
MCP Server → User: OAuth consent screen
User → grants permission
MCP Server → stores access token scoped to user
MCP Server → uses token for SharePoint API calls
```

The MCP spec includes an OAuth 2.1 authorization flow. Use it when:
- The server accesses third-party services on behalf of the user
- Different users have different permissions
- You need refresh tokens for long-running sessions

### mTLS (for high-security enterprise)

For Project 3 (regulated environment): mutual TLS between agent host and MCP server. Both sides present certificates. No shared secret to leak.

---

## Permission Scoping

Every tool must declare its minimum required permissions. The host enforces them.

```json
{
  "name": "approve_claim",
  "description": "Approve an insurance claim and trigger payment.",
  "requiredPermissions": ["claims:write", "payments:initiate"],
  "riskLevel": "high"
}
```

**Rules for Project 2 and 3:**
- Read tools: no special permissions needed
- Write tools: require explicit user scope in the session token
- High-risk tools (payment, deletion, approval): require `high` risk acknowledgment + dry-run mode by default
- Per-tenant scoping: a tool call from Tenant A can never access Tenant B's data — enforce at the MCP server level, not just the application level

---

## Tool Definition Best Practices

### Write descriptions for the model, not for developers

```json
// Bad — developer description
"description": "Calls the policy API endpoint with a policy ID"

// Good — model description
"description": "Look up an insurance policy to find what it covers, its limits, exclusions, and when it's valid. Use this when the user asks about their coverage or what a policy includes."
```

### Be explicit about return format

```json
"description": "... Returns a JSON object with fields: coverage_type (string), limit_amount (number in EUR), deductible (number in EUR), exclusions (array of strings), effective_date (ISO date), expiry_date (ISO date)."
```

The model uses the return format description to construct follow-up reasoning. Vague return descriptions → the model guesses the structure.

### Name tools as verbs, not nouns

```
get_policy_coverage    ✅
policy_coverage        ❌
PolicyCoverageRetriever ❌
```

### Typed schemas, not free text

```json
// Bad
"parameters": {"query": "string describing what you want"}

// Good
"parameters": {
  "policy_id": {"type": "string", "pattern": "POL-[0-9]{4}-[0-9]{3}"},
  "coverage_type": {"type": "string", "enum": ["comprehensive", "third-party", "fire"]}
}
```

Structured inputs mean the model can't pass garbage. Enums are especially valuable — they constrain the model's output to valid values.

---

## Error Handling

MCP tools must return errors in a structured way, not crash:

```python
@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    try:
        result = await business_logic(arguments)
        return [types.TextContent(type="text", text=json.dumps(result))]
    except PolicyNotFoundError as e:
        # Return structured error the model can reason about
        return [types.TextContent(
            type="text",
            text=json.dumps({"error": "policy_not_found", "policy_id": arguments["policy_id"],
                             "message": "No policy found with this ID. Check the ID format (POL-YYYY-NNN)."})
        )]
    except PermissionError:
        return [types.TextContent(
            type="text",
            text=json.dumps({"error": "permission_denied",
                             "message": "You do not have permission to access this policy."})
        )]
    except Exception as e:
        # Log internally, return generic error to model
        logger.exception(f"Tool {name} failed", extra={"arguments": arguments})
        return [types.TextContent(
            type="text",
            text=json.dumps({"error": "internal_error",
                             "message": "The tool encountered an error. Try again or contact support."})
        )]
```

**The model reads the error message** to decide what to do next. Write error messages that tell the model what corrective action is possible.

### Retry behavior

The MCP client should retry on:
- Network errors (connection reset, timeout) — up to 3 times with exponential backoff
- HTTP 429 (rate limit) — respect `Retry-After` header
- HTTP 503 (server unavailable) — backoff + retry

Do not retry on:
- HTTP 400 (bad input — fix the request)
- HTTP 401/403 (auth failure — escalate to user)
- HTTP 404 (not found — tell the model, don't retry)

---

## MCP Servers to Build Per Project

### Project 1 — Enterprise Knowledge Platform

| Server | Tools | Transport |
|---|---|---|
| `knowledge-search-mcp` | `search_documents`, `get_document`, `list_sources` | SSE |
| `feedback-mcp` | `submit_feedback`, `mark_helpful`, `report_hallucination` | SSE |

### Project 2 — Workflow Automation Platform

| Server | Tools | Transport |
|---|---|---|
| `document-store-mcp` | `get_invoice`, `get_purchase_order`, `list_pending_approvals` | SSE |
| `approval-mcp` | `approve_item`, `reject_item`, `escalate_item`, `get_approval_history` | SSE |
| `notification-mcp` | `send_email`, `send_slack_message` | SSE |
| `audit-log-mcp` | `write_audit_entry`, `query_audit_log` | SSE (write-only for agent) |

### Project 3 — Insurance / Compliance Copilot

| Server | Tools | Transport |
|---|---|---|
| `policy-mcp` | `get_policy`, `get_coverage`, `get_exclusions` | SSE (read-only) |
| `claims-mcp` | `get_claim`, `get_claim_history`, `flag_for_review`, `approve_claim` (high-risk) | SSE |
| `compliance-mcp` | `check_ai_act_requirement`, `get_audit_trail`, `write_decision_record` | SSE |
| `document-mcp` | `get_regulatory_document`, `search_regulations` | SSE (self-hosted) |

---

## Testing MCP Servers

### Unit test each tool handler

```python
async def test_get_policy_coverage():
    result = await call_tool("get_policy_coverage", {"policy_id": "POL-2024-001"})
    data = json.loads(result[0].text)
    assert data["coverage_type"] == "comprehensive"
    assert data["limit_amount"] > 0

async def test_get_policy_coverage_not_found():
    result = await call_tool("get_policy_coverage", {"policy_id": "POL-0000-000"})
    data = json.loads(result[0].text)
    assert data["error"] == "policy_not_found"
```

### Integration test with MCP Inspector

MCP Inspector is an official debugging tool — connect it to your server and manually invoke tools to verify behavior before wiring to an agent.

```bash
npx @modelcontextprotocol/inspector python my_server.py
# Opens a browser UI to list tools, call them, inspect responses
```

### Contract test: verify the tool schema matches the implementation

```python
# Ensure the declared inputSchema actually validates what the handler expects
def test_tool_schema_contract():
    schema = get_tool_schema("get_policy_coverage")
    validator = jsonschema.Draft7Validator(schema["inputSchema"])
    
    # Valid input should pass schema
    assert validator.is_valid({"policy_id": "POL-2024-001"})
    
    # Missing required field should fail schema
    assert not validator.is_valid({})
```

---

## MCP Server Versioning

When you change a tool's schema or behavior:
- **Additive changes** (new optional parameter, new field in response): backwards-compatible, no version bump needed
- **Breaking changes** (remove parameter, change required fields, rename tool): bump server version, support old version in parallel during rollout, then deprecate

Expose version in the server's initialization response:
```json
{"serverInfo": {"name": "policy-mcp", "version": "2.1.0"}}
```

Clients can gate on version to handle capability differences gracefully.
