# Terminal 3 Network (T3N) ADK: Developer Experience & Bug Report

**Prepared for:** Terminal 3 Network Core Team & Superteam Challenge Reviewers  
**Subject:** Technical evaluation of `@terminal3/t3n-sdk` and Quickstart Walkthrough  

---

## 1. High-Priority Bugs & Technical Friction Points

### Bug #1: TypeScript Strict Null / Parameter Overload on `metamask_sign`
* **Location:** `quickstart.ts` Step 3:
  ```typescript
  EthSign: metamask_sign(address, undefined, T3N_API_KEY)
  ```
* **Issue:** In TypeScript 5.x with `"strict": true`, passing literal `undefined` as the second argument causes type checker error `TS2345: Argument of type 'undefined' is not assignable to parameter of type 'Eip1193Provider'`.
* **Proposed Fix in `@terminal3/t3n-sdk`:**
  Update function signature definition in `.d.ts`:
  ```typescript
  export function metamask_sign(
    address: string,
    provider?: Eip1193Provider | null | undefined,
    apiKey?: string
  ): EthSignHandler;
  ```

---

### Bug #2: Bundler Collision with WebAssembly Component Loading
* **Location:** `const wasmComponent = await loadWasmComponent();`
* **Issue:** Under modern Vite 5+ and Next.js 14+ (App Router), importing `@terminal3/t3n-sdk` triggers WebAssembly compilation errors due to bundlers treating `.wasm` as static assets rather than executable modules.
* **Proposed Documentation Addition:**
  Add a dedicated "Bundler Configuration" section to `quickstart.md`:
  ```javascript
  // next.config.mjs
  export default {
    experimental: {
      serverComponentsExternalPackages: ['@terminal3/t3n-sdk']
    }
  };
  ```

---

### Bug #3: Sandbox trust manifest rejected as malformed
* **Observed:** 2026-09-11 with `@terminal3/t3n-sdk@5.15.2` on Node 24.14.0.
* **Reproduction:** Call `setEnvironment("sandbox")`, then `await fetchTrustedManifest("sandbox")`.
* **Actual result:** `Error: Trust manifest at https://cn-api.sg.testnet.t3n.terminal3.io/api/trust-manifest is malformed.`
* **Impact:** A correctly fail-closed client cannot complete the trust-anchor gate or proceed to a verified handshake.
* **Suggested diagnostic improvement:** Include the missing or invalid manifest field in the sanitized error so operators can distinguish schema drift from truncation or an invalid signature.

---

## 2. Platform Strengths
* **Fail-closed security design:** `fetchTrustedManifest` is documented to verify the operator signature against an SDK-pinned key and never return an unverified anchor. The current sandbox manifest error correctly blocks this project from claiming a verified enclave session.
* **Frictionless Auth:** Instantly provisioning an enterprise DID (`did:t3n:...`) and test tokens without manual KYC approval accelerates time-to-first-call to under 5 minutes.
* **Enterprise Fit:** Native Verifiable Credential support makes T3N the premier infrastructure for B2B multi-agent collaboration.
