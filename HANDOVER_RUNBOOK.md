# T3N SentryAgent: Enterprise Handover Runbook & Operations Guide

## 1. Handover Decision & Commitment
We are excited to submit **T3N SentryAgent** to the Terminal 3 Network team. 
**Handover Preference:** We provide the T3N team with full operational handover rights to adopt, distribute, and host this enterprise agent on the T3N Startup Program & Listing Page, while offering ongoing open-source upstream maintenance support.

---

## 2. Architecture & Operational Blueprint
T3N SentryAgent is architected for zero-maintenance enterprise autonomy:
1. **Local Policy Boundary:** Deterministic supplier and budget policy is testable without credentials; this local layer is not described as confidential execution.
2. **Deterministic Trust Gate:** The Node runtime enforces `fetchTrustedManifest("sandbox")` at boot and fails closed if the signed manifest cannot be verified.
3. **Authenticated Runtime Boundary:** With `T3N_API_KEY`, the runtime loads the official WASM component, verifies the manifest, completes `handshake()` and `authenticate()`, and uses the returned DID. Enclave-backed execution may be claimed only after that live path succeeds and sanitized attestation evidence is retained.

---

## 3. Step-by-Step Handover Procedure for T3N Core Team

### Step 1: Environment & Credential Setup
Provision an enterprise identity on T3N and configure environment variables:
```bash
export T3N_API_KEY="t3n_live_..."
export T3N_CLUSTER="sandbox" # production requires a separate verified release gate
export ENTERPRISE_TENANT_DID="did:t3n:enterprise:0x..."
```

### Step 2: Docker Containerization
Run as an autonomous daemon container:
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npx", "tsx", "src/agent.ts"]
```

### Step 3: Health & Liveness Probes
For Kubernetes / Docker Swarm deployments:
- **Liveness Probe:** `npm run health` (exits non-zero unless the official SDK accepts the live operator-signed trust manifest).
- **Restart Policy:** `always` with exponential backoff on RPC network partitions.

### Step 4: Policy Reconfiguration
To update the enterprise supplier whitelist or daily spending ceiling without redeploying code:
- Edit `src/agent.ts` policy constructor or provide a signed T3N Verifiable Credential policy object.
