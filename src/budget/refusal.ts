/**
 * A refusal is the budget policy rejecting a payment on-chain.
 *
 * A refusal is not a failure. The system did exactly what it promised: the
 * agent tried to spend past its budget and the contract said no. This module
 * keeps that distinction typed, so no caller ever reports a correctly-refused
 * payment as an error.
 */
import { CONTRACT_ERROR_REGISTRY, decodeContractError } from "smart-account-kit";

/** The payment would have exceeded the budget for the current window. */
export const SPENDING_LIMIT_EXCEEDED = 3221;

/**
 * The budget policy was attached to a rule that is not scoped to a specific
 * contract. The policy refuses to install on a `Default` rule, so every budget
 * must be scoped to the asset being spent.
 */
export const ONLY_CALL_CONTRACT_ALLOWED = 3227;

export type Refusal = {
  /** On-chain contract code, e.g. `3221`. */
  readonly code: number;
  /** True when the refusal was specifically an over-budget attempt. */
  readonly overBudget: boolean;
  /** The contract's own explanation. */
  readonly reason: string;
};

function describe(code: number): Refusal | null {
  const entry = CONTRACT_ERROR_REGISTRY[code];
  if (!entry || entry.family !== "SpendingLimit") return null;
  return { code, overBudget: code === SPENDING_LIMIT_EXCEEDED, reason: entry.message };
}

/** Look up a refusal by its on-chain contract code. */
export function refusalFromCode(code: number): Refusal | null {
  return describe(code);
}

/**
 * Decode a host diagnostic, such as one captured from a failed simulation,
 * into a refusal. Returns `null` when the diagnostic is not a budget refusal.
 */
export function refusalFromDiagnostic(diagnostic: string): Refusal | null {
  const decoded = decodeContractError(diagnostic);
  return decoded ? describe(decoded.contractCode ?? decoded.code) : null;
}
