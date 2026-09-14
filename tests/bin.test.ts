/**
 * The artefact people actually run.
 *
 * `server.test.ts` proves the tools work in-process. This proves the built
 * binary starts, speaks the protocol over stdio, and reports the budget given
 * on the command line — which is the only path a user takes.
 *
 * Skipped when `dist/` is absent, so `npm test` alone does not fail; CI builds
 * first, so there it always runs.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { describe, expect, it } from "vitest";

const DIST = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const EXAMPLE = fileURLToPath(new URL("../examples/budget.testnet.json", import.meta.url));

describe.skipIf(!existsSync(DIST))("the built binary", () => {
  it("serves the budget it was given, over stdio", async () => {
    const transport = new StdioClientTransport({
      command: "node",
      args: [DIST, EXAMPLE],
    });
    const client = new Client({ name: "bin-test", version: "0.0.0" });
    await client.connect(transport);

    try {
      const { tools } = await client.listTools();
      expect(tools.map((tool) => tool.name).sort()).toEqual([
        "check_spend",
        "explain_refusal",
        "get_budget",
      ]);

      const result = await client.callTool({ name: "get_budget", arguments: {} });
      const text = (result.content as Array<{ type: string; text?: string }>)
        .map((part) => part.text ?? "")
        .join("");
      expect(text).toContain("research allowance");
    } finally {
      await client.close();
    }
  }, 20_000);
});
