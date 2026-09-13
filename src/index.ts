/**
 * stellar-x402-mcp — an x402 payer whose spending budget is enforced on-chain.
 *
 * This entry point is not wired to a transport yet. The budget domain is the
 * first slice; the smart-account wiring and MCP surface follow.
 */
export * from "./budget/index.js";
