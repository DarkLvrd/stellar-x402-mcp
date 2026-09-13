# stellar-x402-mcp

An MCP server that gives an AI agent a Stellar wallet with a spending budget **enforced by a Soroban smart contract** — an x402 payer that cannot overspend, even if the agent is compromised.

## The problem

Agents can now pay for things. The [x402 protocol](https://developers.stellar.org/docs/build/agentic-payments/x402) turns HTTP `402 Payment Required` into a real payment, and Stellar settles it with SEP-41 token transfers. The missing half is the limit.

Every implementation today enforces that limit **inside the agent's own process** — a check in JavaScript, right before the wallet signs. That defends against a careless agent. It does not defend against a process that is compromised, replaced, restarted mid-window, or simply wrong. For a scraping tool, that is an acceptable risk. For money, it is the whole risk.

## What this does instead

The budget lives in a **Soroban smart account**, not in our process.

```
   AI agent  ──MCP──▶  stellar-x402-mcp  ──x402──▶  paid API
                             │
                             │  signs with the agent key
                             ▼
                    Smart account (C…)
                             │
                    ┌────────┴────────┐
                    │  budget policy  │  refuses anything over budget
                    └────────┬────────┘
                             ▼
                      SEP-41 transfer settles
```

1. The human approves a budget **once** — say `5 USDC per day`.
2. The budget is installed on-chain as a context rule scoped to the USDC contract, with OpenZeppelin's `spending_limit` policy attached.
3. The agent key can authorise payments. It cannot change the budget, and it cannot move funds anywhere else.
4. A payment over budget is refused **by the contract**. Our code can be wrong and the budget still holds.

## Why not just use `@x402/mcp`?

Because the difference is exactly the thing you want from a limit.

| | `@x402/mcp` | this project |
|---|---|---|
| Where the cap lives | In your Node process | In a Soroban contract |
| Survives a restart | No — state is in-process | Yes — state is on-chain |
| Holds if the agent is compromised | No | Yes |
| Budget window | Per payment | Rolling window, resets on-chain |
| Who can change the cap | Whoever edits the config | Requires the account's signers |

`@x402/mcp` is good software, and its own documentation says as much: *"In production, the MCP bridge should check the payment requirements before creating or signing a payment payload"*, and it lists *"per-user, per-agent, or per-session spend limits"* as things **you** must build. This project is that layer, built where it cannot be bypassed.

## Why Stellar

- **x402 is a first-class Stellar initiative**, with SEP-41 settlement, a production facilitator, and an official quickstart on testnet and mainnet.
- **Stellar's smart accounts** make on-chain spending limits practical: Protocol 27 offers cheap cross-contract calls, so a policy contract can enforce a rolling budget without becoming a cost problem.
- **The pieces are composable and live**: OpenZeppelin ship audited `stellar-contracts`, and `smart-account-kit` exposes context rules, external Ed25519 signers, and a typed `spending_limit` policy client.

## Status

**Early. Testnet only.** Do not point this at mainnet.

- [x] Budget domain — validation, unit conversion, typed refusals
- [x] Platform-contract tests pinning the assumptions we inherit
- [ ] Smart-account wiring — deploy, add agent key, install budget
- [ ] x402 payment path signed from the smart account
- [ ] MCP surface and tools
- [ ] End-to-end testnet proof: one payment allowed, one refused

## Security

This project is **pre-1.0 and unaudited**. Read this before using it with anything you care about.

- **Testnet only.** v1 targets `stellar:testnet` exclusively.
- **Hot keys.** The agent holds a key that can spend within its budget. Keep budgets small enough that losing one is survivable.
- **Unaudited dependencies.** `smart-account-kit` describes itself as *"unaudited integration software"* and warns: *"Limit balances, signer permissions, policy allowances, and relayer permissions. Do not store or control assets you cannot afford to lose."* The underlying OpenZeppelin contracts carry a [separate audit](https://www.openzeppelin.com/news/stellar-contracts-rc-v0.7.0-audit) with a different scope.

## The budget model

A budget is data. It can be written to a file, reviewed, and handed to someone else to inspect.

```ts
import { defineBudget } from "stellar-x402-mcp";

const budget = defineBudget({
  amount: "5",                 // per window, in whole tokens
  windowDays: 1,
  asset: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA", // testnet USDC
});
```

Two rules the code enforces rather than assumes:

- **No rounding.** An amount the asset cannot represent exactly is rejected, never silently rounded. A budget you did not ask for is worse than one that fails.
- **Every budget is scoped.** The `spending_limit` policy refuses to install on a `Default` rule (code `3227`, `OnlyCallContractAllowed`), so a budget is always attached to `CallContract(asset)`.

A payment the budget policy rejects is a **refusal**, not an error. The system worked. That distinction is typed:

```ts
import { refusalFromDiagnostic } from "stellar-x402-mcp";

const refusal = refusalFromDiagnostic("HostError: Error(Contract, #3221)");
if (refusal?.overBudget) {
  // the contract did its job
}
```

## Development

```bash
npm install
npm run check   # typecheck, build, test
```

## License

MIT
