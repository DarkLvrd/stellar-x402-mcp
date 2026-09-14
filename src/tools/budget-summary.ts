/**
 * Say a budget out loud.
 *
 * The human approved a number; this is how they hear it back. A budget rendered
 * at the wrong scale is a budget they misread, which is why `decimals` travels
 * on the budget itself.
 */
import { LEDGERS_PER_DAY, fromBaseUnits, type Budget } from "../budget/index.js";

export function describeBudget(budget: Budget): string {
  const limit = fromBaseUnits(budget.limit, budget.decimals);
  const days = budget.windowLedgers / LEDGERS_PER_DAY;
  const window = Number.isInteger(days) ? `${days} day(s)` : `${budget.windowLedgers} ledgers`;

  return [
    `Budget: ${budget.label}`,
    `  Spendable:   ${limit} per ${window}`,
    `  Asset:       ${budget.asset}`,
    `  Window:      ${budget.windowLedgers} ledgers`,
    "",
    "This limit is enforced by a contract on the smart account, not by this server.",
  ].join("\n");
}
