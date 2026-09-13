/**
 * stellar-x402-mcp — an x402 payer whose spending budget is enforced on-chain.
 *
 * This entry point is not wired to a transport yet. The budget domain and its
 * on-chain installation shape are the first slice; the MCP surface follows.
 */
export * from "./budget/index.js";
export { TESTNET, type TestnetAddresses } from "./stellar/testnet.js";
