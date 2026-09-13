import { describe, expect, it } from "vitest";
import {
  LEDGERS_PER_DAY,
  USDC_DECIMALS,
  daysToLedgers,
  defineBudget,
  fromBaseUnits,
  isContractId,
  toBaseUnits,
} from "../src/budget/index.js";

/** Testnet USDC, as published by Stellar. */
const TESTNET_USDC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

describe("toBaseUnits", () => {
  it("converts whole tokens", () => {
    expect(toBaseUnits("5", USDC_DECIMALS)).toBe(50_000_000n);
  });

  it("converts fractional tokens", () => {
    expect(toBaseUnits("0.01", USDC_DECIMALS)).toBe(100_000n);
  });

  it("converts the smallest representable unit", () => {
    expect(toBaseUnits("1.2345678", USDC_DECIMALS)).toBe(12_345_678n);
  });

  it("accepts a number as well as a string", () => {
    expect(toBaseUnits(2, USDC_DECIMALS)).toBe(20_000_000n);
  });

  it("rejects a non-numeric amount", () => {
    expect(() => toBaseUnits("five", USDC_DECIMALS)).toThrow(/positive decimal/);
  });

  it("rejects a negative amount", () => {
    expect(() => toBaseUnits("-1", USDC_DECIMALS)).toThrow(/positive decimal/);
  });

  it("rejects precision the asset cannot represent, instead of rounding it", () => {
    expect(() => toBaseUnits("1.23456789", USDC_DECIMALS)).toThrow(/decimal places/);
  });
});

describe("fromBaseUnits", () => {
  it("round-trips a whole amount", () => {
    expect(fromBaseUnits(50_000_000n, USDC_DECIMALS)).toBe("5");
  });

  it("round-trips a fractional amount", () => {
    expect(fromBaseUnits(100_000n, USDC_DECIMALS)).toBe("0.01");
  });

  it("trims trailing zeros", () => {
    expect(fromBaseUnits(1_500_000n, USDC_DECIMALS)).toBe("0.15");
  });

  it("round-trips any representable amount", () => {
    for (const amount of ["1", "0.0000001", "123.4567891"]) {
      expect(fromBaseUnits(toBaseUnits(amount, USDC_DECIMALS), USDC_DECIMALS)).toBe(amount);
    }
  });
});

describe("daysToLedgers", () => {
  it("converts a day", () => {
    expect(daysToLedgers(1)).toBe(LEDGERS_PER_DAY);
  });

  it("converts a week", () => {
    expect(daysToLedgers(7)).toBe(7 * LEDGERS_PER_DAY);
  });

  it("rejects a zero or negative window", () => {
    expect(() => daysToLedgers(0)).toThrow(/positive number of days/);
    expect(() => daysToLedgers(-1)).toThrow(/positive number of days/);
  });

  it("rejects a non-finite window", () => {
    expect(() => daysToLedgers(Number.NaN)).toThrow(/positive number of days/);
  });
});

describe("isContractId", () => {
  it("accepts a real SEP-41 contract id", () => {
    expect(isContractId(TESTNET_USDC)).toBe(true);
  });

  it("rejects a Stellar account address", () => {
    expect(isContractId("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5")).toBe(false);
  });
});

describe("defineBudget", () => {
  it("builds a budget from human terms", () => {
    const budget = defineBudget({ amount: "5", windowDays: 1, asset: TESTNET_USDC });

    expect(budget.limit).toBe(50_000_000n);
    expect(budget.windowLedgers).toBe(LEDGERS_PER_DAY);
    expect(budget.asset).toBe(TESTNET_USDC);
    expect(budget.label).toBe("5 per 1 day(s)");
  });

  it("carries a custom label into the audit trail", () => {
    const budget = defineBudget({
      amount: "0.25",
      windowDays: 7,
      asset: TESTNET_USDC,
      label: "research allowance",
    });

    expect(budget.label).toBe("research allowance");
    expect(budget.limit).toBe(2_500_000n);
  });

  it("rejects an asset that is not a contract id", () => {
    expect(() => defineBudget({ amount: "5", windowDays: 1, asset: "USDC" })).toThrow(/contract id/);
  });

  it("rejects a zero budget", () => {
    expect(() => defineBudget({ amount: "0", windowDays: 1, asset: TESTNET_USDC })).toThrow(
      /greater than zero/,
    );
  });

  it("rejects precision the asset cannot represent", () => {
    expect(() => defineBudget({ amount: "0.00000001", windowDays: 1, asset: TESTNET_USDC })).toThrow(
      /decimal places/,
    );
  });
});
