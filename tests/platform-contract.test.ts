/**
 * Our contract with the platforms we build on.
 *
 * This project's correctness depends on facts owned by other people: the ledger
 * count a budget window is measured in, and the codes the budget policy refuses
 * with. Those live in `smart-account-kit`. If a release changes them, every
 * budget we have ever configured is silently wrong, so the assumptions are
 * asserted here rather than trusted.
 */
import { LEDGERS_PER_DAY as KIT_LEDGERS_PER_DAY } from "smart-account-kit";
import { describe, expect, it } from "vitest";
import {
  LEDGERS_PER_DAY,
  ONLY_CALL_CONTRACT_ALLOWED,
  SPENDING_LIMIT_EXCEEDED,
  refusalFromCode,
  refusalFromDiagnostic,
} from "../src/budget/index.js";

describe("budget window unit", () => {
  it("agrees with the ledger count the policy is configured in", () => {
    // Read from the kit, not restated. If a release changes the window unit,
    // this fails instead of every budget we configured being quietly wrong.
    expect(KIT_LEDGERS_PER_DAY).toBe(LEDGERS_PER_DAY);
  });

  it("is a whole day of five-second ledgers", () => {
    expect(LEDGERS_PER_DAY * 5).toBe(86_400);
  });
});

describe("refusal codes", () => {
  it("refuses an over-budget payment with a named code", () => {
    const refusal = refusalFromCode(SPENDING_LIMIT_EXCEEDED);
    expect(refusal).not.toBeNull();
    expect(refusal?.overBudget).toBe(true);
    expect(refusal?.reason).toMatch(/exceed the spending limit/i);
  });

  it("treats the CallContract-only constraint as a refusal, not an over-budget one", () => {
    const refusal = refusalFromCode(ONLY_CALL_CONTRACT_ALLOWED);
    expect(refusal).not.toBeNull();
    expect(refusal?.overBudget).toBe(false);
    expect(refusal?.reason).toMatch(/CallContract/i);
  });

  it("does not claim every code as a budget refusal", () => {
    expect(refusalFromCode(3000)).toBeNull();
    expect(refusalFromCode(999_999)).toBeNull();
  });

  it("decodes a host diagnostic into a refusal", () => {
    const refusal = refusalFromDiagnostic("HostError: Error(Contract, #3221)");
    expect(refusal?.overBudget).toBe(true);
  });

  it("returns null for a diagnostic that is not a budget refusal", () => {
    expect(refusalFromDiagnostic("HostError: Error(Contract, #3000)")).toBeNull();
  });
});
