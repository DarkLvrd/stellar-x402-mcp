/**
 * A budget as a file a human reviews.
 *
 * The budget is the artefact the human approves, so it has to live somewhere
 * readable, diffable, and reviewable — not buried in code. Two rules make the
 * file trustworthy:
 *
 * - Every field is required, and unknown fields are rejected. A budget that
 *   quietly accepted a default is a budget the human did not actually approve.
 * - The network must be `testnet`. A mainnet budget is not a configuration
 *   option in v1; the schema is where that promise is kept, not a runtime check
 *   someone can forget.
 */
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { defineBudget, isContractId, type Budget } from "./budget.js";

const BudgetFileSchema = z.strictObject({
  /** Per-window ceiling, as a human decimal string: `"5"`, `"0.25"`. */
  amount: z.string().min(1),
  /** Window length in days. */
  windowDays: z.number().positive(),
  /** SEP-41 contract id of the asset that may be spent. */
  asset: z.string().describe("SEP-41 contract id").refine(isContractId, {
    message: "must be a SEP-41 contract id (C followed by 55 base-32 characters)",
  }),
  /** Human description, carried into the audit trail. */
  label: z.string().min(1).optional(),
  /** v1 is testnet only. Anything else is refused here. */
  network: z.literal("testnet"),
});

export type BudgetFile = z.infer<typeof BudgetFileSchema>;

/**
 * Parse and validate a budget file.
 *
 * @param text - the file contents.
 * @param source - where the text came from, for error messages.
 * @throws with the source and the offending field, never a bare parse error.
 */
export function parseBudgetFile(text: string, source = "<budget>"): Budget {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (cause) {
    throw new Error(`${source} is not valid JSON: ${(cause as Error).message}`);
  }

  const parsed = BudgetFileSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
      .join("; ");
    throw new Error(`${source} is not a valid budget: ${problems}`);
  }

  return defineBudget({
    amount: parsed.data.amount,
    windowDays: parsed.data.windowDays,
    asset: parsed.data.asset,
    ...(parsed.data.label === undefined ? {} : { label: parsed.data.label }),
  });
}

/** Read a budget from disk and validate it. */
export async function loadBudgetFile(path: string): Promise<Budget> {
  const text = await readFile(path, "utf8");
  return parseBudgetFile(text, path);
}
