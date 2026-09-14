/**
 * Explain a payment the budget policy refused.
 *
 * A refusal is not a failure. It is the product working, and the agent should
 * be told so plainly rather than being handed a stack trace to retry against.
 */
import {
  ONLY_CALL_CONTRACT_ALLOWED,
  SPENDING_LIMIT_EXCEEDED,
  refusalFromCode,
  refusalFromDiagnostic,
  type Refusal,
} from "../budget/index.js";

export type RefusalExplanation = Refusal & { advice: string };

function adviceFor(refusal: Refusal): string {
  if (refusal.code === SPENDING_LIMIT_EXCEEDED) {
    return "The payment was refused on-chain for exceeding the budget. Do not retry it. Either wait for the window to roll over, or ask the human to raise the budget.";
  }
  if (refusal.code === ONLY_CALL_CONTRACT_ALLOWED) {
    return "The budget is attached to a rule that is not scoped to a single contract. A budget must be scoped to the asset it can spend.";
  }
  return "The budget policy refused this payment. Do not retry it; report it.";
}

/**
 * Explain a refusal from either a host diagnostic or a contract code.
 * Returns `null` when the input is not a budget refusal at all.
 */
export function explainRefusal(input: { diagnostic?: string; code?: number }): RefusalExplanation | null {
  const refusal =
    input.diagnostic !== undefined
      ? refusalFromDiagnostic(input.diagnostic)
      : input.code !== undefined
        ? refusalFromCode(input.code)
        : null;

  return refusal ? { ...refusal, advice: adviceFor(refusal) } : null;
}
