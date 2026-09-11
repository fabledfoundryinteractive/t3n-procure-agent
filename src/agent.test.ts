import test from "node:test";
import assert from "node:assert";
import { T3nProcureAgent, ProcurementOrder } from "./agent.js";

test("T3N SentryAgent Approves Compliant Order Within Budget", async () => {
  const agent = new T3nProcureAgent("did:t3n:test:corp", 15000);
  await agent.initialize();

  const validOrder: ProcurementOrder = {
    orderId: "PO-TEST-001",
    supplierDid: "did:t3n:supplier:cloud-infra-core",
    lineItems: [{ description: "Server Compute", quantity: 1, unitPriceUsd: 4500 }],
    totalAmountUsd: 4500,
    deliveryDate: "2026-10-01",
    complianceRequirements: ["SOC2"]
  };

  const res = await agent.evaluateOrder(validOrder);
  assert.strictEqual(res.approved, true);
  assert.ok(res.auditHash.startsWith("0xT3N_"));
});

test("T3N SentryAgent Rejects Unapproved Supplier", async () => {
  const agent = new T3nProcureAgent("did:t3n:test:corp", 15000);
  await agent.initialize();

  const rogueOrder: ProcurementOrder = {
    orderId: "PO-ROGUE-002",
    supplierDid: "did:t3n:attacker:unknown-entity",
    lineItems: [{ description: "Unknown Asset", quantity: 1, unitPriceUsd: 1000 }],
    totalAmountUsd: 1000,
    deliveryDate: "2026-10-01",
    complianceRequirements: ["SOC2"]
  };

  const res = await agent.evaluateOrder(rogueOrder);
  assert.strictEqual(res.approved, false);
  assert.ok(res.reason.includes("not in the enterprise approved registry"));
});

test("T3N SentryAgent Rejects Orders Exceeding Daily Budget", async () => {
  const agent = new T3nProcureAgent("did:t3n:test:corp", 5000);
  await agent.initialize();

  const excessiveOrder: ProcurementOrder = {
    orderId: "PO-OVER-003",
    supplierDid: "did:t3n:supplier:cloud-infra-core",
    lineItems: [{ description: "Bulk Hardware", quantity: 1, unitPriceUsd: 8000 }],
    totalAmountUsd: 8000,
    deliveryDate: "2026-10-01",
    complianceRequirements: ["SOC2"]
  };

  const res = await agent.evaluateOrder(excessiveOrder);
  assert.strictEqual(res.approved, false);
  assert.ok(res.reason.includes("exceeds remaining daily procurement budget"));
});
