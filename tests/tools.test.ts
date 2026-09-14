import { describe, expect, it } from "vitest";
import { defineBudget } from "../src/budget/index.js";
import { checkSpend, describeBudget, explainRefusal } from "../src/tools/index.js";
import { TESTNET } from "../src/stellar/testnet.js";

const budget = defineBudget({
  amount: "5",
  windowDays: 1,
  asset: TESTNET.usdc,
  label: "research allowance",
});

describe("describeBudget", () => {
  it("says the budget the way the human approved it", () => {
    const text = describeBudget(budget);

    expect(text).toContain("research allowance");
    expect(text).toContain("5 per 1 day(s)");
    expect(text).toContain(TESTNET.usdc);
  });

  it("renders the limit at the asset's own scale", () => {
    const tenDecimals = defineBudget({
      amount: "1.5",
      windowDays: 1,
      asset: TESTNET.usdc,
      decimals: 10,
    });

    // The same bigint would read as 15 at 7 decimals. Getting this wrong is how
    // a human is told a budget other than the one they approved.
    expect(describeBudget(tenDecimals)).toContain("1.5 per");
  });

  it("states who enforces the limit", () => {
    expect(describeBudget(budget)).toMatch(/enforced by a contract/i);
  });
});

describe("checkSpend", () => {
  it("allows a payment inside the budget", () => {
    const check = checkSpend({ budget, amount: "0.25" });

    expect(check.allowed).toBe(true);
    expect(check.remainingAfter).toBe("4.75");
  });

  it("refuses a payment that exceeds the budget, and names the excess", () => {
    const check = checkSpend({ budget, amount: "7" });

    expect(check.allowed).toBe(false);
    expect(check.reason).toContain("exceeds 5 by 2");
    expect(check.remainingAfter).toBe("0");
  });

  it("counts what is already spent this window", () => {
    // 4.5 already spent, 0.5 more lands exactly on the 5 limit.
    const exact = checkSpend({ budget, amount: "0.5", alreadySpent: "4.5" });
    expect(exact.allowed).toBe(true);
    expect(exact.remainingAfter).toBe("0");

    // 4.5 + 1 exceeds it, and the excess is named.
    const over = checkSpend({ budget, amount: "1", alreadySpent: "4.5" });
    expect(over.allowed).toBe(false);
    expect(over.reason).toContain("exceeds 5 by 0.5");
  });

  it("treats a payment of exactly the budget as allowed", () => {
    expect(checkSpend({ budget, amount: "5" }).allowed).toBe(true);
  });

  it("refuses a non-positive payment", () => {
    expect(() => checkSpend({ budget, amount: "0" })).toThrow(/greater than zero/);
  });

  it("says that its answer is not the authority", () => {
    expect(checkSpend({ budget, amount: "1" }).advisory).toMatch(/contract|advisory/i);
  });
});

describe("explainRefusal", () => {
  it("explains an over-budget refusal and says not to retry", () => {
    const explanation = explainRefusal({ code: 3221 });

    expect(explanation?.overBudget).toBe(true);
    expect(explanation?.advice).toMatch(/Do not retry/i);
  });

  it("explains the CallContract-only constraint", () => {
    const explanation = explainRefusal({ code: 3227 });

    expect(explanation?.overBudget).toBe(false);
    expect(explanation?.advice).toMatch(/scoped to (a single|the) .*contract/i);
  });

  it("decodes a host diagnostic", () => {
    expect(explainRefusal({ diagnostic: "HostError: Error(Contract, #3221)" })?.overBudget).toBe(
      true,
    );
  });

  it("does not claim a non-refusal as a refusal", () => {
    expect(explainRefusal({ code: 3000 })).toBeNull();
    expect(explainRefusal({ diagnostic: "HostError: Error(Contract, #3000)" })).toBeNull();
  });
});
