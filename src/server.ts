/**
 * The MCP surface.
 *
 * Three tools, all of which work: report the budget, advise on a payment, and
 * explain a refusal. The payment tool is deliberately absent — it needs a
 * signing path that does not exist yet (see the repository's issue tracker),
 * and a tool that pretends to pay would be worse than no tool.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Budget } from "./budget/index.js";
import { checkSpend, describeBudget, explainRefusal } from "./tools/index.js";

const INSTRUCTIONS = [
  "This server reports a spending budget that a contract on a Stellar smart account enforces.",
  "",
  "You cannot raise, bypass, or negotiate the budget. It was set by a human and lives on-chain.",
  "check_spend is advice: the contract decides, and this server can be wrong.",
  "A refusal is not an error. It means the budget did its job.",
].join("\n");

function text(body: string) {
  return { content: [{ type: "text" as const, text: body }] };
}

export function createServer(input: { budget: Budget }): McpServer {
  const { budget } = input;
  const server = new McpServer(
    { name: "stellar-x402-mcp", version: "0.1.0" },
    { instructions: INSTRUCTIONS },
  );

  server.registerTool(
    "get_budget",
    {
      title: "Get the approved budget",
      description:
        "Report the spending budget the human approved: the limit, the window it resets over, and the asset it may be spent in.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => text(describeBudget(budget)),
  );

  server.registerTool(
    "check_spend",
    {
      title: "Check a payment against the budget",
      description:
        "Ask whether a payment would fit the budget, given what has already been spent this window. Advisory: the on-chain policy makes the decision.",
      inputSchema: {
        amount: z.string().describe('Payment amount in whole tokens, such as "0.25".'),
        alreadySpent: z
          .string()
          .optional()
          .describe("Already spent in the current window, in whole tokens. Defaults to none."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ amount, alreadySpent }) => {
      const check = checkSpend({
        budget,
        amount,
        ...(alreadySpent === undefined ? {} : { alreadySpent }),
      });

      return text(
        [
          check.allowed ? "Within budget." : "Over budget.",
          `  Limit:         ${check.limit}`,
          `  Already spent: ${check.alreadySpent}`,
          `  This payment:  ${check.amount}`,
          `  Remaining:     ${check.remainingAfter}`,
          "",
          check.reason,
          "",
          check.advisory,
        ].join("\n"),
      );
    },
  );

  server.registerTool(
    "explain_refusal",
    {
      title: "Explain a refused payment",
      description:
        "Explain a payment the budget policy refused, from either a host diagnostic or an on-chain error code. A refusal is the budget working, not a fault.",
      inputSchema: {
        diagnostic: z
          .string()
          .optional()
          .describe('Host diagnostic, such as "HostError: Error(Contract, #3221)".'),
        code: z.number().int().optional().describe("On-chain contract code, such as 3221."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ diagnostic, code }) => {
      const explanation = explainRefusal({
        ...(diagnostic === undefined ? {} : { diagnostic }),
        ...(code === undefined ? {} : { code }),
      });

      if (!explanation) {
        return text("That is not a budget refusal. Investigate it as an ordinary failure.");
      }

      return text(
        [
          `Refused on-chain (code ${explanation.code}).`,
          `  Reason: ${explanation.reason}`,
          "",
          explanation.advice,
        ].join("\n"),
      );
    },
  );

  return server;
}
