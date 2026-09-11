import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { fetchTrustedManifest, setEnvironment } from "@terminal3/t3n-sdk";

export interface ProcurementOrder {
  orderId: string;
  supplierDid: string;
  lineItems: Array<{ description: string; quantity: number; unitPriceUsd: number }>;
  totalAmountUsd: number;
  deliveryDate: string;
  complianceRequirements: Array<"SOC2" | "ISO27001" | "OFAC_CLEARED">;
}

export interface VerificationResult {
  orderId: string;
  approved: boolean;
  reason: string;
  auditHash: string;
  timestamp: string;
  trustStatus: "verified";
}

export type TrustVerifier = () => Promise<void>;
export type CredentialVerifier = (supplierDid: string, requirement: ProcurementOrder["complianceRequirements"][number]) => Promise<boolean>;

export async function verifySandboxTrustAnchor(): Promise<void> {
  setEnvironment("sandbox");
  await fetchTrustedManifest("sandbox");
}

export class T3nProcureAgent {
  private tenantDid: string;
  private maxDailyBudgetUsd: number;
  private currentSpendUsd: number = 0;
  private approvedSuppliers: Set<string>;
  private trustVerified = false;
  private readonly verifyTrust: TrustVerifier;
  private readonly verifyCredential: CredentialVerifier;

  constructor(
    tenantDid: string = "did:t3n:enterprise:unconfigured",
    maxDailyBudgetUsd: number = 25000,
    verifyTrust: TrustVerifier = verifySandboxTrustAnchor,
    verifyCredential: CredentialVerifier = async () => {
      throw new Error("Authenticated T3N credential verification is not configured.");
    }
  ) {
    this.tenantDid = tenantDid;
    this.maxDailyBudgetUsd = maxDailyBudgetUsd;
    this.verifyTrust = verifyTrust;
    this.verifyCredential = verifyCredential;
    this.approvedSuppliers = new Set([
      "did:t3n:supplier:cloud-infra-core",
      "did:t3n:supplier:silicon-logistics-corp",
      "did:t3n:supplier:apex-legal-services"
    ]);
  }

  async initialize(apiKey?: string): Promise<string> {
    console.log("[*] Initializing T3N ProcureAgent...");
    console.log("[*] Verifying the operator-signed T3N sandbox trust manifest...");

    await this.verifyTrust();
    this.trustVerified = true;

    if (apiKey) {
      console.log(`[+] Trust anchor verified. API key is configured for tenant: ${this.tenantDid}`);
    } else {
      console.log("[+] Trust anchor verified. Authentication is not configured; policy evaluation only.");
    }

    return this.tenantDid;
  }

  async evaluateOrder(order: ProcurementOrder): Promise<VerificationResult> {
    if (!this.trustVerified) {
      throw new Error("Trust anchor is not verified. Call initialize() and resolve any verification error first.");
    }
    console.log(`\n[*] Evaluating Procurement Order ${order.orderId} from ${order.supplierDid}...`);
    console.log(`    Total Value: $${order.totalAmountUsd.toLocaleString()} USD`);

    if (!this.approvedSuppliers.has(order.supplierDid)) {
      return {
        orderId: order.orderId,
        approved: false,
        reason: `REJECTED: Supplier ${order.supplierDid} is not in the enterprise approved registry.`,
        auditHash: "0x0000_SUPPLIER_NOT_ALLOWLISTED",
        timestamp: new Date().toISOString(),
        trustStatus: "verified"
      };
    }

    if (this.currentSpendUsd + order.totalAmountUsd > this.maxDailyBudgetUsd) {
      return {
        orderId: order.orderId,
        approved: false,
        reason: `REJECTED: Order exceeds remaining daily procurement budget ($${(this.maxDailyBudgetUsd - this.currentSpendUsd).toLocaleString()} remaining).`,
        auditHash: "0x0000_BUDGET_EXCEEDED",
        timestamp: new Date().toISOString(),
        trustStatus: "verified"
      };
    }

    for (const req of order.complianceRequirements) {
      const verified = await this.verifyCredential(order.supplierDid, req);
      if (!verified) {
        return {
          orderId: order.orderId,
          approved: false,
          reason: `REJECTED: Required credential ${req} did not pass the configured verifier.`,
          auditHash: "sha256:credential-verification-failed",
          timestamp: new Date().toISOString(),
          trustStatus: "verified"
        };
      }
      console.log(`    [✓] Credential verifier accepted ${req}.`);
    }

    this.currentSpendUsd += order.totalAmountUsd;
    const auditHash = `sha256:${createHash("sha256")
      .update(JSON.stringify({ order, tenantDid: this.tenantDid, currentSpendUsd: this.currentSpendUsd }))
      .digest("hex")}`;

    return {
      orderId: order.orderId,
      approved: true,
      reason: "APPROVED: Policy checks and configured credential verification passed. No settlement was executed.",
      auditHash,
      timestamp: new Date().toISOString(),
      trustStatus: "verified"
    };
  }

  getBudgetStatus() {
    return {
      dailyCeiling: this.maxDailyBudgetUsd,
      spentToday: this.currentSpendUsd,
      remaining: this.maxDailyBudgetUsd - this.currentSpendUsd
    };
  }
}

// Auto-run if executed directly
async function main() {
  const agent = new T3nProcureAgent();
  await agent.initialize(process.env.T3N_API_KEY);

  const sampleOrder: ProcurementOrder = {
    orderId: "PO-2026-09-881",
    supplierDid: "did:t3n:supplier:cloud-infra-core",
    lineItems: [
      { description: "Confidential GPU Compute Clusters (H100)", quantity: 4, unitPriceUsd: 2500 }
    ],
    totalAmountUsd: 10000,
    deliveryDate: "2026-09-30",
    complianceRequirements: ["SOC2", "ISO27001", "OFAC_CLEARED"]
  };

  const result = await agent.evaluateOrder(sampleOrder);
  console.log("\n--- PROCUREMENT EVALUATION RESULT ---");
  console.log(JSON.stringify(result, null, 2));
}

const isDirectRun = process.argv[1]
  ? fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  : false;

if (isDirectRun) {
  main().catch((error) => {
    console.error("T3N initialization failed closed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
