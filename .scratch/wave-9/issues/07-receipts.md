# Read settlement receipts back from the chain

**Complexity: Medium (150 points)**

## Why

This project's rule is that the *receipt* is truth, not the HTTP response. That
rule is currently a comment in `CONTEXT.md` with no code behind it.

## What done looks like

Given a transaction hash, return the settlement facts read from Stellar RPC:

- ledger, success or failure
- the SEP-41 transfer's from, to, and amount
- the asset contract

Design notes:

- the return type must be able to say "not settled yet" as distinct from "failed"
- it must not throw on a hash it cannot find
- the RPC client should be injectable so tests run without a network

## Where

- `src/receipt/read.ts`
- `tests/receipt.test.ts`
