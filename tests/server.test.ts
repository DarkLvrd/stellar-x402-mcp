/**
 * The server, over the real protocol.
 *
 * These go through an in-memory transport rather than calling the tool
 * functions, so a tool that is registered wrongly — or not reachable at all —
 * fails here rather than in someone's agent.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defineBudget } from "../src/budget/index.js";
import { createServer } from "../src/server.js";
import { TESTNET } from "../src/stellar/testnet.js";

const budget = defineBudget({
  amount: "5",
  windowDays: 1,
  asset: TESTNET.usdc,
  label: "research allowance",
});

let client: Client;

beforeEach(async () => {
  const server = createServer({ budget });
  client = new Client({ name: "test-client", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
});

afterEach(async () => {
  await client.close();
});

function textOf(result: unknown): string {
  const content = (result as { content?: Array<{ type: string; text?: string }> }).content ?? [];
  return content
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("\n");
}

describe("the MCP surface", () => {
  it("exposes exactly the tools it claims, and no payment tool", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((tool) => tool.name).sort();

    expect(names).toEqual(["check_spend", "explain_refusal", "get_budget"]);
    // `pay` is deliberately absent: the signing path does not exist yet, and a
    // tool that pretended to pay would be worse than no tool.
    expect(names).not.toContain("pay");
  });

  it("reports the budget over the protocol", async () => {
    const result = await client.callTool({ name: "get_budget", arguments: {} });

    expect(textOf(result)).toContain("research allowance");
    expect(textOf(result)).toContain("5 per 1 day(s)");
  });

  it("answers a payment question over the protocol", async () => {
    const within = await client.callTool({
      name: "check_spend",
      arguments: { amount: "0.5" },
    });
    expect(textOf(within)).toContain("Within budget.");

    const over = await client.callTool({
      name: "check_spend",
      arguments: { amount: "50" },
    });
    expect(textOf(over)).toContain("Over budget.");
  });

  it("explains a refusal, and refuses to explain a non-refusal", async () => {
    const refusal = await client.callTool({
      name: "explain_refusal",
      arguments: { code: 3221 },
    });
    expect(textOf(refusal)).toContain("Refused on-chain");

    const other = await client.callTool({
      name: "explain_refusal",
      arguments: { code: 3000 },
    });
    expect(textOf(other)).toContain("not a budget refusal");
  });
});
