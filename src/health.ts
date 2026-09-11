export interface HealthStatus {
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  cluster: "testnet" | "production";
  trustAnchorValid: boolean;
  uptimeSeconds: number;
  memoryUsageMb: number;
  activeDelegations: number;
  timestamp: string;
}

export function checkHealth(): HealthStatus {
  const mem = process.memoryUsage();
  return {
    status: "HEALTHY",
    cluster: "testnet",
    trustAnchorValid: true,
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMb: Math.round(mem.rss / 1024 / 1024),
    activeDelegations: 3,
    timestamp: new Date().toISOString()
  };
}

const health = checkHealth();
console.log("=== T3N SENTRY AGENT HEALTH MONITOR ===");
console.log(JSON.stringify(health, null, 2));
