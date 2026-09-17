# The budget rule must be the only authority

A context rule is chosen **by the client**, not by the chain. When a payment matches more than one rule, the client names which rule it is authorising under, and the account evaluates only that one. A `Default` rule carrying a signer and no policies therefore matches everything, and a client that names it pays without any policy being consulted.

We found this the hard way on testnet. An account held two rules: `#0`, `Default (Any Operation)` with the passkey and **0 policies**, and `#1`, `CallContract(XLM)` with a spending limit of 100 XLM per day. A transfer of **1000 XLM — ten times the budget — succeeded**, because the client authorised under rule `#0`. Rule `#1` could not have authorised anything: it had no signers. So the only rule that could have produced that authorisation was the unrestricted one.

The budget was not bypassed by a bug. It was bypassed by a rule the client was entitled to choose.

## Consequences

- **A budget is only as strong as the absence of an unrestricted rule.** Installing a budget alongside a `Default` signer rule does not protect anything; it produces the *appearance* of a limit.
- **Setup must not leave an unrestricted path.** Whatever creates the spending rule should either forbid a companion `Default` rule on the same account, or remove it. This is the part we got wrong in the manual walkthrough.
- **The client must pin the context rule.** The kit's own guidance says to "pin the auth context explicitly when a tx can match more than one rule". Our `pay` tool must pin to the budget rule, and treat the ability to name a different rule as a security boundary, not a parameter.
- **The refusal path is untested.** We never observed `3221 SpendingLimitExceeded` from a real transfer, because the transfer never reached the policy. The walkthrough's step 5 remains unproven.

## Considered Options

- **Allow a `Default` rule and rely on the client pinning** — rejected: makes the budget a convention rather than a guarantee, which is the exact position `@x402/mcp` already occupies.
- **Forbid a `Default` rule on a budgeted account** — accepted as the direction, with the enforcement point still to be decided.
- **Warn in documentation only** — rejected: a warning that a security property is conditional is not a security property.
