/**
 * What an approved budget implies on-chain.
 *
 * This is where a platform constraint becomes visible in our own types: the
 * spending-limit policy refuses to install on a `Default` rule (contract code
 * 3227, `OnlyCallContractAllowed`). A budget therefore always compiles to a
 * rule scoped to the one asset it may spend. There is no code path here that
 * can produce a broader rule, by construction.
 */
import {
  createCallContractContext,
  createEd25519Signer,
  createSpendingLimitParams,
  type ContextRuleType,
  type ContractSigner,
} from "smart-account-kit";
import type { Budget } from "./budget.js";

export type BudgetInstallation = {
  /** The key permitted to spend under this budget. */
  readonly signer: ContractSigner;
  /** The rule scope. Always `CallContract(budget.asset)`. */
  readonly context: ContextRuleType;
  /** Parameters for the on-chain budget policy. */
  readonly policyParams: ReturnType<typeof createSpendingLimitParams>;
  /** Human summary, for the audit trail. */
  readonly summary: string;
};

/**
 * Compile a budget into the signer, scope, and policy parameters it installs as.
 *
 * The ScVal conversion and the transaction are the caller's job, so this stays
 * a pure function that can be reasoned about and tested without a chain.
 */
export function installBudget(input: {
  budget: Budget;
  /** The agent's Ed25519 public key. */
  agentPublicKey: Uint8Array;
  /** Verifier contract that validates the agent's key. */
  ed25519VerifierAddress: string;
}): BudgetInstallation {
  const { budget } = input;

  return {
    signer: createEd25519Signer(input.ed25519VerifierAddress, input.agentPublicKey),
    context: createCallContractContext(budget.asset),
    policyParams: createSpendingLimitParams(budget.limit, budget.windowLedgers),
    summary: `${budget.label}, spendable only as ${budget.asset}`,
  };
}
