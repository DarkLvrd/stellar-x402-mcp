# Wire the `pay` tool to x402

**Complexity: High (200 points)**

## Why

The MCP surface deliberately has no `pay` tool, because the signing path does
not exist yet. A tool that pretended to pay would be worse than no tool. This is
the ticket that makes the project do the thing it is named after.

## What done looks like

An x402 payment signed from the **smart account**, not from a plain key, so the
on-chain budget applies to it:

- the payment's `from` is the smart account address
- the auth entry is signed by the account's signer with the context rule bound
- a payment over budget is refused by the contract, and surfaced as a *refusal*
- a payment inside budget settles, and the receipt is read back

## Blocked by

Upstream: `stellar/smart-account-kit` — signing an auth entry with an Ed25519
external signer without submitting. Track the linked issue; do not hand-roll the
auth digest, which ADR-0002 rules out.
