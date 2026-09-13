import { formatContextType } from "smart-account-kit";
import { describe, expect, it } from "vitest";
import { defineBudget, installBudget } from "../src/budget/index.js";
import { TESTNET } from "../src/stellar/testnet.js";

const agentKey = new Uint8Array(32).fill(7);

function budgetFor(asset: string, amount = "5") {
  return defineBudget({ amount, windowDays: 1, asset });
}

describe("installBudget", () => {
  it("compiles a budget into a budget policy with the same figures", () => {
    const budget = budgetFor(TESTNET.usdc, "5");
    const installation = installBudget({
      budget,
      agentPublicKey: agentKey,
      ed25519VerifierAddress: TESTNET.ed25519Verifier,
    });

    expect(installation.policyParams.spending_limit).toBe(50_000_000n);
    expect(installation.policyParams.period_ledgers).toBe(17_280);
  });

  it("scopes every budget to the asset it may spend", () => {
    // The policy refuses a Default rule (code 3227), so this scope is the only
    // shape a budget may take. Asserted for two assets so it cannot pass by
    // accidentally hard-coding one.
    for (const asset of [
      TESTNET.usdc,
      "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    ]) {
      const installation = installBudget({
        budget: budgetFor(asset),
        agentPublicKey: agentKey,
        ed25519VerifierAddress: TESTNET.ed25519Verifier,
      });

      expect(installation.context.tag).toBe("CallContract");
      expect(installation.context.values).toEqual([asset]);
      expect(formatContextType(installation.context)).toContain(asset.slice(0, 4));
    }
  });

  it("carries the human label into the summary", () => {
    const budget = defineBudget({
      amount: "0.5",
      windowDays: 7,
      asset: TESTNET.usdc,
      label: "research allowance",
    });

    const installation = installBudget({
      budget,
      agentPublicKey: agentKey,
      ed25519VerifierAddress: TESTNET.ed25519Verifier,
    });

    expect(installation.summary).toContain("research allowance");
    expect(installation.summary).toContain(TESTNET.usdc);
  });

  it("installs the agent key against the Ed25519 verifier", () => {
    const installation = installBudget({
      budget: budgetFor(TESTNET.usdc),
      agentPublicKey: agentKey,
      ed25519VerifierAddress: TESTNET.ed25519Verifier,
    });

    expect(installation.signer.tag).toBe("External");
    expect(JSON.stringify(installation.signer)).toContain(TESTNET.ed25519Verifier);
  });

  it("refuses a verifier that is not a contract address", () => {
    expect(() =>
      installBudget({
        budget: budgetFor(TESTNET.usdc),
        agentPublicKey: agentKey,
        ed25519VerifierAddress: "not-a-contract",
      }),
    ).toThrow(/contract address/i);
  });
});
