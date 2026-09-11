# T3N SentryAgent: Enterprise B2B Procurement & Compliance Agent

**Built for the Terminal 3 Network (T3N) Enterprise Agent Build Challenge**  
**Prize Track:** 290 USDC (1st Place: 100 USDC)  
**Live Interactive Policy Simulator (not an enclave):** https://fabledfoundryinteractive.github.io/t3n-procure-agent/
**Repository:** https://github.com/fabledfoundryinteractive/t3n-procure-agent  
**On-Chain Payout Address (USDC / SOL):** `DXwUYnkHkgDUi7qerLg9fPZhSHksGNSsnGD1YHZudg8V`  

---

## 🏢 Overview

T3N SentryAgent is an enterprise procurement policy agent integrating the **Terminal 3 Network (T3N) ADK** (`@terminal3/t3n-sdk@5.15.2`). The Node runtime fails closed unless `fetchTrustedManifest("sandbox")` verifies the operator-signed trust manifest. The public static page is a policy simulator and does not claim enclave execution.

It addresses the fundamental enterprise security challenge in agentic commerce: **how can autonomous agents transact with external suppliers without leaking proprietary pricing, business relationships, or sensitive internal credentials?**

### Key Capabilities:
1. **Fail-Closed Trust Verification:** Refuses order evaluation until the official SDK verifies the operator-signed sandbox trust manifest.
2. **Honest Runtime Boundary:** A T3N API key and successful authenticated handshake are required before claiming enclave-backed execution; the static UI remains an explicitly labeled simulator.
3. **Decentralized Identity & Smart VCs:** Validates supplier Decentralized Identifiers (`did:t3n:...`) and Verifiable Credentials (SOC 2 Type II, ISO 27001, OFAC sanctions clearance).
4. **Policy-Bounded Delegation:** Enforces rigid per-day spending limits and whitelisted supplier registries.
5. **Non-Repudiation Receipts:** Produces cryptographic audit hashes and signed execution proofs.

---

## 🛠️ Challenge Requirements & Deliverables

1. **Enterprise Usefulness & Maintenance Focus:**  
   Designed for low-friction operations with built-in health monitoring (`src/health.ts`), automated enclave liveness checks, and clean stateless architecture.
2. **Handover Commitment & Runbook:**  
   We provide full operational handover rights to the Terminal 3 Network team to host, distribute, and maintain this agent on the T3N Startup Program & Listing Page. Complete step-by-step procedures are documented in **[HANDOVER_RUNBOOK.md](./HANDOVER_RUNBOOK.md)**.
3. **Developer Experience & Bug Report:**  
   Detailed evaluation of `@terminal3/t3n-sdk`, TypeScript strict-mode null checks on `metamask_sign`, WASM component bundler collisions, and error message clarity in **[DOCS_FEEDBACK_AND_BUGS.md](./DOCS_FEEDBACK_AND_BUGS.md)**.

---

## 🚀 Quickstart

### 1. Run Interactive Web Simulator
Open the live policy simulator:
👉 **[Launch T3N SentryAgent Simulator](https://fabledfoundryinteractive.github.io/t3n-procure-agent/)**

### 2. Run Locally via TypeScript
```bash
npm install
export T3N_API_KEY="your_t3n_key_from_claim_page"
npx tsx src/agent.ts
```

### 3. Check Health & Enclave Telemetry
```bash
npx tsx src/health.ts
```

The health command exits non-zero when the live trust manifest cannot be verified. As observed on 2026-09-11 with SDK 5.15.2, the sandbox endpoint returned `Trust manifest ... is malformed`; this is recorded as a blocker rather than converted into a false healthy state.

---

## 📄 Documentation Links
* [Enterprise Handover Runbook](./HANDOVER_RUNBOOK.md)
* [SDK Bug Report & Documentation Feedback](./DOCS_FEEDBACK_AND_BUGS.md)

---

## 🛡️ License
MIT License • Built by Fabled Foundry Interactive (`@fabledfoundryinteractive`).
