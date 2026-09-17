# Prove the testnet guard refuses *everything* else

**Complexity: Trivial (100 points)**

## Why

`parseBudgetFile` refuses any network that is not exactly `testnet`. The current
test checks three wrong values. The promise we make — "v1 cannot touch mainnet" —
is stronger than three examples.

## What done looks like

A property-style test over a broad set of near-misses, asserting each is
refused:

`mainnet`, `pubnet`, `public`, `stellar:mainnet`, `stellar:pubnet`,
`STELLAR:TESTNET`, `Testnet`, ` testnet`, `testnet `, `""`, and a missing field.

The point is the near-misses: a guard that accepts ` testnet` or `Testnet` is a
guard that will one day be bypassed by a typo.

## Where

- `tests/budget-file.test.ts`
