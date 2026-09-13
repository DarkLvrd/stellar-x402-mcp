/**
 * Unit conversions for budgets.
 *
 * A budget is expressed to a human in whole tokens ("5 USDC per day"), but the
 * budget policy takes an integer and a window in ledgers. These are the only
 * two places that conversion happens.
 */

/**
 * Ledgers in a day, as the budget policy counts time.
 *
 * Must match `LEDGERS_PER_DAY` from `smart-account-kit`, which is what the
 * on-chain policy is configured with. Stellar closes a ledger roughly every 5
 * seconds, so a day is ~17,280 ledgers.
 */
export const LEDGERS_PER_DAY = 17_280;

/** USDC on Stellar carries 7 decimal places, like every SEP-41 token. */
export const USDC_DECIMALS = 7;

/**
 * Convert a human decimal amount to the asset's base units.
 *
 * @throws if the amount is not a positive decimal, or carries more precision
 * than the asset supports. Rounding is never applied: a budget the human did
 * not ask for is worse than a rejected one.
 */
export function toBaseUnits(amount: string | number, decimals: number): bigint {
  const text = typeof amount === "number" ? amount.toString() : amount;
  if (!/^\d+(\.\d+)?$/.test(text)) {
    throw new Error(`budget amount must be a positive decimal, got: ${text}`);
  }
  const [whole = "0", fraction = ""] = text.split(".");
  if (fraction.length > decimals) {
    throw new Error(
      `budget amount ${text} has more than ${decimals} decimal places; it cannot be represented exactly`,
    );
  }
  return BigInt(whole + fraction.padEnd(decimals, "0"));
}

/** Convert base units back to a human decimal string. */
export function fromBaseUnits(units: bigint, decimals: number): string {
  const digits = units.toString().padStart(decimals + 1, "0");
  const whole = digits.slice(0, digits.length - decimals);
  const fraction = digits.slice(digits.length - decimals).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

/** Convert a window in days to the ledger count the budget policy expects. */
export function daysToLedgers(days: number): number {
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error(`budget window must be a positive number of days, got: ${days}`);
  }
  return Math.ceil(days * LEDGERS_PER_DAY);
}
