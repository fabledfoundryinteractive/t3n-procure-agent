export interface HealthStatus {
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  cluster: "sandbox" | "production";
  trustAnchorValid: boolean;
  uptimeSeconds: number;
  memoryUsageMb: number;
  activeDelegations: number;
  timestamp: string;
  detail: string;
}

export type HealthVerifier = () => Promise<void>;

async function verifyLiveTrust(): Promise<void> {
  const { verifySandboxTrustAnchor } = await import("./agent.js");
  await verifySandboxTrustAnchor();
}

export async function checkHealth(verifyTrust: HealthVerifier = verifyLiveTrust): Promise<HealthStatus> {
  const mem = process.memoryUsage();
  try {
    await verifyTrust();
  } catch (error) {
    return {
      status: "DOWN",
      cluster: "sandbox",
      trustAnchorValid: false,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Math.round(mem.rss / 1024 / 1024),
      activeDelegations: 0,
      timestamp: new Date().toISOString(),
      detail: error instanceof Error ? error.message : String(error)
    };
  }
  return {
    status: "HEALTHY",
    cluster: "sandbox",
    trustAnchorValid: true,
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMb: Math.round(mem.rss / 1024 / 1024),
    activeDelegations: 0,
    timestamp: new Date().toISOString(),
    detail: "Operator-signed sandbox trust manifest verified."
  };
}

const health = await checkHealth();
console.log("=== T3N SENTRY AGENT HEALTH MONITOR ===");
console.log(JSON.stringify(health, null, 2));
if (!health.trustAnchorValid) process.exitCode = 1;
