/**
 * A budget is the human's one-time approval of what the agent may spend.
 *
 * It is data, not behaviour: it can be written to a file, reviewed, and handed
 * to someone else to inspect. This mirrors the selector-registry pattern from
 * agentic-linkedin, applied to money instead of DOM selectors.
 */
import { daysToLedgers, toBaseUnits, USDC_DECIMALS } from "./units.js";

export type Budget = {
  /** Maximum spend per window, in the asset's base units. */
  readonly limit: bigint;
  /** Rolling window length, in ledgers. */
  readonly windowLedgers: number;
  /** SEP-41 contract id of the asset that may be spent. */
  readonly asset: string;
  /** Human description, carried into the audit trail. */
  readonly label: string;
};

/** A SEP-41 contract id is `C` followed by 55 base-32 characters. */
export function isContractId(value: string): boolean {
  return /^C[A-Z2-7]{55}$/.test(value);
}

export type BudgetInput = {
  /** Per-window ceiling, as a human decimal string, e.g. `"5"` or `"0.25"`. */
  amount: string;
  /** Window length in days. */
  windowDays: number;
  /** SEP-41 contract id of the spendable asset. */
  asset: string;
  /** Decimals for the asset. Defaults to USDC's 7. */
  decimals?: number;
  /** Optional human description. */
  label?: string;
};

/**
 * Build a validated budget.
 *
 * Every field is checked here rather than at the point of payment: a budget
 * that cannot be enforced must never reach the chain.
 */
export function defineBudget(input: BudgetInput): Budget {
  const decimals = input.decimals ?? USDC_DECIMALS;

  if (!isContractId(input.asset)) {
    throw new Error(
      `budget asset must be a SEP-41 contract id (C followed by 55 base-32 characters), got: ${input.asset}`,
    );
  }

  const limit = toBaseUnits(input.amount, decimals);
  if (limit <= 0n) {
    throw new Error(`budget amount must be greater than zero, got: ${input.amount}`);
  }

  const windowLedgers = daysToLedgers(input.windowDays);

  return {
    limit,
    windowLedgers,
    asset: input.asset,
    label: input.label ?? `${input.amount} per ${input.windowDays} day(s)`,
  };
}
