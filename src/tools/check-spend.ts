/**
 * Would this payment fit the budget?
 *
 * This is advice, not authority. The contract decides. The tool says so in its
 * own output, because a caller that treats our arithmetic as the guarantee has
 * misunderstood the entire design.
 */
import { fromBaseUnits, toBaseUnits, type Budget } from "../budget/index.js";

export type SpendCheck = {
  /** Our best answer. The contract's answer is the one that counts. */
  allowed: boolean;
  limit: string;
  alreadySpent: string;
  amount: string;
  remainingAfter: string;
  reason: string;
  advisory: string;
};

export function checkSpend(input: {
  budget: Budget;
  /** The payment being considered, in whole tokens. */
  amount: string;
  /** Already spent in the current window, in whole tokens. Defaults to none. */
  alreadySpent?: string;
}): SpendCheck {
  const { budget } = input;
  const amount = toBaseUnits(input.amount, budget.decimals);
  const alreadySpent =
    input.alreadySpent === undefined ? 0n : toBaseUnits(input.alreadySpent, budget.decimals);

  if (amount <= 0n) {
    throw new Error(`payment amount must be greater than zero, got: ${input.amount}`);
  }

  const total = alreadySpent + amount;
  const allowed = total <= budget.limit;
  const show = (units: bigint) => fromBaseUnits(units, budget.decimals);

  return {
    allowed,
    limit: show(budget.limit),
    alreadySpent: show(alreadySpent),
    amount: show(amount),
    remainingAfter: show(total > budget.limit ? 0n : budget.limit - total),
    reason: allowed
      ? `${show(amount)} fits: ${show(alreadySpent)} + ${show(amount)} is within ${show(budget.limit)}`
      : `${show(amount)} does not fit: ${show(alreadySpent)} + ${show(amount)} exceeds ${show(budget.limit)} by ${show(total - budget.limit)}`,
    advisory:
      "Advisory only. The budget policy on the smart account makes the decision; this server can be wrong.",
  };
}
