# Enforce the budget on-chain, not in our process

We need an agent that can pay for resources but cannot overspend. The obvious build is a check in our own TypeScript before we sign — which is what `@x402/mcp` does with `spendControls` and `policies`. We rejected it. An in-process check defends against a careless agent, not against a compromised, replaced, or simply restarted process, and a rolling-window budget would need us to rebuild that state and durability ourselves.

Instead the budget is OpenZeppelin's `spending_limit` policy, attached to a context rule on a Soroban smart account. The agent key authorizes payments; the contract refuses anything over budget. Our process may be wrong, restarted, or hostile, and the budget still holds.

## Considered Options

- **In-process policy checks** — rejected: protects by cooperation, not by construction, and duplicates what the official package already ships.
- **A per-payment human approval prompt as the primary control** — rejected: rebuilds the weaker model, and cannot bound a compromised process.
