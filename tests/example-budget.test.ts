/**
 * The example budget we ship must be valid.
 *
 * Documentation that no longer parses is worse than none: someone will copy it
 * and get an error they did not cause.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseBudgetFile } from "../src/budget/index.js";

const EXAMPLE = fileURLToPath(new URL("../examples/budget.testnet.json", import.meta.url));

describe("examples/budget.testnet.json", () => {
  it("parses as a valid budget", async () => {
    const text = await readFile(EXAMPLE, "utf8");
    const budget = parseBudgetFile(text, "examples/budget.testnet.json");

    expect(budget.limit).toBeGreaterThan(0n);
    expect(budget.windowLedgers).toBeGreaterThan(0);
  });
});
