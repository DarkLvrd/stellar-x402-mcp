/**
 * Every address we build against is checked here.
 *
 * A transposed character in a contract id does not fail loudly until a
 * transaction is submitted against the wrong contract. Catching it in CI is
 * cheaper.
 */
import { describe, expect, it } from "vitest";
import { isContractId } from "../src/budget/index.js";
import { TESTNET } from "../src/stellar/testnet.js";

const CONTRACT_ADDRESSES = {
  usdc: TESTNET.usdc,
  webauthnVerifier: TESTNET.webauthnVerifier,
  ed25519Verifier: TESTNET.ed25519Verifier,
  spendingLimitPolicy: TESTNET.spendingLimitPolicy,
  nativeToken: TESTNET.nativeToken,
} as const;

describe("testnet addresses", () => {
  for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
    it(`${name} is a well-formed SEP-41 contract id`, () => {
      expect(isContractId(address), `${name} = ${address}`).toBe(true);
    });
  }

  it("has a 64-character WASM hash", () => {
    expect(TESTNET.accountWasmHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("names the network the way x402 does", () => {
    expect(TESTNET.caip2).toBe("stellar:testnet");
    expect(TESTNET.networkPassphrase).toBe("Test SDF Network ; September 2015");
  });

  it("points at a Stellar RPC endpoint", () => {
    expect(TESTNET.rpcUrl).toMatch(/^https:\/\/soroban-testnet\.stellar\.org\/?$/);
  });
});
