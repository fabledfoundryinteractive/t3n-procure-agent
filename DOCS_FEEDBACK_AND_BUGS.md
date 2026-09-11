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

### Bug #3: Error Message Ambiguity on Trust Manifest Timeouts
* **Location:** `T3nClient` constructor trust anchor validation.
* **Issue:** When `fetchTrustedManifest("testnet")` encounters an intermittent RPC timeout, the client immediately throws `Error: trustAnchor is required`. This misleads developers into thinking they forgot to pass the parameter, rather than diagnosing an outbound network timeout.
* **Proposed Fix:** Differentiate between `missing parameter` and `failed manifest resolution`.

---

## 2. Platform Strengths
* **Uncompromising Security:** The TEE enclave trust anchor verification (`fetchTrustedManifest`) provides real cryptographic assurance that the agent is running in genuine confidential hardware, not a malicious mock.
* **Frictionless Auth:** Instantly provisioning an enterprise DID (`did:t3n:...`) and test tokens without manual KYC approval accelerates time-to-first-call to under 5 minutes.
* **Enterprise Fit:** Native Verifiable Credential support makes T3N the premier infrastructure for B2B multi-agent collaboration.
