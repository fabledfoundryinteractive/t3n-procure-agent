# T3N SentryAgent: Enterprise Handover Runbook & Operations Guide

## 1. Handover Decision & Commitment
We are excited to submit **T3N SentryAgent** to the Terminal 3 Network team. 
**Handover Preference:** We provide the T3N team with full operational handover rights to adopt, distribute, and host this enterprise agent on the T3N Startup Program & Listing Page, while offering ongoing open-source upstream maintenance support.

---

## 2. Architecture & Operational Blueprint
T3N SentryAgent is architected for zero-maintenance enterprise autonomy:
1. **Confidential TEE Boundary:** All policy evaluation, credential decryption, and supplier evaluations execute inside Intel SGX / AMD SEV confidential enclaves.
2. **Deterministic Trust Anchor:** Enforces `fetchTrustedManifest("testnet" | "production")` at boot, preventing man-in-the-middle attacks.
3. **Stateless Scalability:** Can be deployed across multiple redundant enclave nodes behind a round-robin load balancer.

---

## 3. Step-by-Step Handover Procedure for T3N Core Team

### Step 1: Environment & Credential Setup
Provision an enterprise identity on T3N and configure environment variables:
```bash
export T3N_API_KEY="t3n_live_..."
export T3N_CLUSTER="testnet" # or "production"
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
- **Liveness Probe:** `npx tsx src/health.ts` (exits 0 when enclave attestation and trust anchors are valid).
- **Restart Policy:** `always` with exponential backoff on RPC network partitions.

### Step 4: Policy Reconfiguration
To update the enterprise supplier whitelist or daily spending ceiling without redeploying code:
- Edit `src/agent.ts` policy constructor or provide a signed T3N Verifiable Credential policy object.
