# `check_spend` ignores the rolling window

**Complexity: Medium (150 points)**

## Why

A budget is a *rolling* window measured in ledgers, and the on-chain policy
resets itself when the window expires. `check_spend` does not model that at all:
it takes `alreadySpent` as a number the caller simply asserts, so its advice is
wrong the moment a window rolls over — and wrong in the dangerous direction
(refusing a payment that would in fact succeed).

## What done looks like

`check_spend` can compute the current state from the chain:

- given a current ledger sequence and the ledger at which the window opened,
  decide whether the window has rolled
- when it has, treat already-spent as zero
- when it has not, account for spend within the window only

Keep it pure: take the ledger numbers as arguments, do not reach for an RPC
inside this function. The RPC call belongs at the edge.

## Where

- `src/tools/check-spend.ts`
- `tests/tools.test.ts`
