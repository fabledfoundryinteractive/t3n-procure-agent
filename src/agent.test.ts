import test from "node:test";
import assert from "node:assert";
import { T3nProcureAgent, ProcurementOrder } from "./agent.js";

const verifiedTrust = async () => {};
const verifiedCredential = async () => true;

test("T3N SentryAgent Approves Compliant Order Within Budget", async () => {
  const agent = new T3nProcureAgent("did:t3n:test:corp", 15000, verifiedTrust, verifiedCredential);
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
  assert.ok(res.auditHash.startsWith("sha256:"));
});

test("T3N SentryAgent Rejects Unapproved Supplier", async () => {
  const agent = new T3nProcureAgent("did:t3n:test:corp", 15000, verifiedTrust);
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
  const agent = new T3nProcureAgent("did:t3n:test:corp", 5000, verifiedTrust);
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

test("T3N SentryAgent fails closed when trust verification fails", async () => {
  const agent = new T3nProcureAgent("did:t3n:test:corp", 5000, async () => {
    throw new Error("manifest rejected");
  });

  await assert.rejects(agent.initialize(), /manifest rejected/);
});

test("T3N SentryAgent refuses evaluation before initialization", async () => {
  const agent = new T3nProcureAgent("did:t3n:test:corp", 5000, verifiedTrust);
  await assert.rejects(
    agent.evaluateOrder({
      orderId: "PO-NOT-INITIALIZED",
      supplierDid: "did:t3n:supplier:cloud-infra-core",
      lineItems: [],
      totalAmountUsd: 10,
      deliveryDate: "2026-10-01",
      complianceRequirements: []
    }),
    /Trust anchor is not verified/
  );
});

test("T3N SentryAgent rejects an order when credential verification fails", async () => {
  const agent = new T3nProcureAgent("did:t3n:test:corp", 5000, verifiedTrust, async () => false);
  await agent.initialize();
  const result = await agent.evaluateOrder({
    orderId: "PO-BAD-CREDENTIAL",
    supplierDid: "did:t3n:supplier:cloud-infra-core",
    lineItems: [],
    totalAmountUsd: 10,
    deliveryDate: "2026-10-01",
    complianceRequirements: ["SOC2"]
  });
  assert.strictEqual(result.approved, false);
  assert.match(result.reason, /did not pass/);
});
