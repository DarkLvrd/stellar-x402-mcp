# stellar-x402-mcp

The shared vocabulary of an MCP server that lets an AI agent pay over Stellar x402 under a budget the blockchain enforces.

## Money and limits

**Budget**:
The most the agent may spend inside one window. Granted once by the human, enforced by a contract, never by our process.
_Avoid_: allowance, cap, quota, spend limit

**Window**:
The rolling period over which a budget refills, measured in ledgers rather than wall-clock time.
_Avoid_: period, interval, reset, epoch

**Budget policy**:
The on-chain contract that refuses any payment which would exceed the budget. The source of the guarantee.
_Avoid_: spending limit policy, guardrail, rule

**Smart account**:
The contract account that holds the funds and pays for resources. The agent never holds funds directly.
_Avoid_: wallet, vault, treasury, safe

**Agent key**:
The Ed25519 key the agent holds. It can authorize payments under a budget, and cannot change the budget or move funds anywhere else.
_Avoid_: private key, signer, hot key

**Payer address**:
The address a payment comes from. Always the smart account, never the agent key.
_Avoid_: from address, sender, source

**Context rule**:
The on-chain entry binding an agent key to a scope and a budget policy. Without a matching rule, a payment is refused.
_Avoid_: permission, policy set, scope entry

## Paying

**Resource**:
The paid content or API sitting behind an HTTP 402 response.
_Avoid_: endpoint, service, API

**Facilitator**:
The third-party service that verifies and settles payments. We never run one.
_Avoid_: relay, settler, processor

**Receipt**:
The settlement proof read back from the chain after a payment. The receipt, not the HTTP response, is our truth that money moved.
_Avoid_: confirmation, result, transaction

**Refusal**:
A payment the budget policy rejected on-chain. Distinct from an error in our own process.
_Avoid_: rejection, denial, failure
