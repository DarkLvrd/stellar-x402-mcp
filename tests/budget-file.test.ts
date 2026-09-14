import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadBudgetFile, parseBudgetFile } from "../src/budget/index.js";
import { TESTNET } from "../src/stellar/testnet.js";

const VALID = JSON.stringify({
  network: "testnet",
  amount: "5",
  windowDays: 1,
  decimals: 7,
  asset: TESTNET.usdc,
  label: "research allowance",
});

describe("parseBudgetFile", () => {
  it("builds a budget from a valid file", () => {
    const budget = parseBudgetFile(VALID, "budget.json");

    expect(budget.limit).toBe(50_000_000n);
    expect(budget.windowLedgers).toBe(17_280);
    expect(budget.asset).toBe(TESTNET.usdc);
    expect(budget.label).toBe("research allowance");
  });

  it("names the file and the field when the JSON is broken", () => {
    expect(() => parseBudgetFile("{ not json", "budget.json")).toThrow(
      /budget\.json is not valid JSON/,
    );
  });

  it("names the field when a value is wrong", () => {
    const bad = JSON.stringify({ ...JSON.parse(VALID), amount: "" });
    expect(() => parseBudgetFile(bad, "budget.json")).toThrow(/amount/);
  });

  it("refuses a misspelled field rather than ignoring it", () => {
    // The important one. `windowDay` instead of `windowDays` must not silently
    // fall back to something the human never approved.
    const typo = JSON.stringify({
      network: "testnet",
      amount: "5",
      windowDay: 1,
      asset: TESTNET.usdc,
    });
    expect(() => parseBudgetFile(typo, "budget.json")).toThrow(/unrecognized|windowDays/i);
  });

  it("refuses a budget with no amount", () => {
    const missing = JSON.stringify({ network: "testnet", windowDays: 1,
  decimals: 7, asset: TESTNET.usdc });
    expect(() => parseBudgetFile(missing, "budget.json")).toThrow(/amount/);
  });

  it("refuses a budget that does not state the asset's decimals", () => {
    // Without decimals, base units cannot be read back at the right scale, and
    // the human would be shown a budget they did not approve.
    const noDecimals = JSON.stringify({
      network: "testnet",
      amount: "5",
      windowDays: 1,
      asset: TESTNET.usdc,
    });
    expect(() => parseBudgetFile(noDecimals, "budget.json")).toThrow(/decimals/);
  });

  it("refuses a network that is not testnet", () => {
    for (const network of ["mainnet", "pubnet", "stellar:mainnet"]) {
      const bad = JSON.stringify({ ...JSON.parse(VALID), network });
      expect(() => parseBudgetFile(bad, "budget.json")).toThrow(/network/);
    }
  });

  it("refuses a missing network, so testnet is never assumed", () => {
    const noNetwork = JSON.stringify({
      amount: "5",
      windowDays: 1,
  decimals: 7,
      asset: TESTNET.usdc,
    });
    expect(() => parseBudgetFile(noNetwork, "budget.json")).toThrow(/network/);
  });

  it("refuses an asset that is not a contract id", () => {
    const bad = JSON.stringify({ ...JSON.parse(VALID), asset: "USDC" });
    expect(() => parseBudgetFile(bad, "budget.json")).toThrow(/contract id/);
  });

  it("refuses a window that is not positive", () => {
    for (const windowDays of [0, -1]) {
      const bad = JSON.stringify({ ...JSON.parse(VALID), windowDays });
      expect(() => parseBudgetFile(bad, "budget.json")).toThrow(/windowDays/);
    }
  });
});

describe("loadBudgetFile", () => {
  it("reads and validates a budget from disk", async () => {
    const dir = await mkdtemp(join(tmpdir(), "budget-"));
    const path = join(dir, "budget.json");
    await writeFile(path, VALID);

    const budget = await loadBudgetFile(path);
    expect(budget.limit).toBe(50_000_000n);
  });
});
