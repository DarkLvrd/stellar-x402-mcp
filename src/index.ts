#!/usr/bin/env node
/**
 * stellar-x402-mcp — an x402 payer whose spending budget is enforced on-chain.
 *
 * A stdio MCP server. Nothing is written to stdout except the protocol.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadBudgetFile } from "./budget/index.js";
import { createServer } from "./server.js";

/** stderr only: stdout is the MCP transport. */
function log(line: string): void {
  process.stderr.write(`stellar-x402-mcp: ${line}\n`);
}

async function main(): Promise<void> {
  const path = process.env["BUDGET_FILE"] ?? process.argv[2];

  if (!path) {
    log("no budget file. Pass a path, or set BUDGET_FILE.");
    log("example: BUDGET_FILE=examples/budget.testnet.json stellar-x402-mcp");
    process.exitCode = 1;
    return;
  }

  const budget = await loadBudgetFile(path);
  log(`budget loaded — ${budget.label}`);

  const server = createServer({ budget });
  await server.connect(new StdioServerTransport());
}

main().catch((error: unknown) => {
  log(`failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
