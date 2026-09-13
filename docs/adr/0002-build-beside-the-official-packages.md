# Depend on `@x402/stellar`, not on `@x402/mcp`

`@x402/mcp` already ships an MCP client bridge with per-payment spend controls and policy hooks. We depend only on `@x402/stellar` for payment correctness, and write our own MCP surface, so that the governance in this repository is visibly ours rather than configuration of someone else's cap.

## Considered Options

- **Extend `@x402/mcp`** — rejected: reduces the central claim to "we configured a cap that already exists", which is exactly the claim we cannot defend.
- **Implement SEP-41 transfers and auth-entry signing ourselves** — rejected: unaudited payment code, with real money on the other side of a mistake.
