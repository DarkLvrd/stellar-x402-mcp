# Ensure a budgeted account has no unrestricted rule

**Complexity: High (200 points)**

## Why

A context rule is chosen by the **client**, not the chain. A `Default` rule with a
signer and no policies matches everything, so a client that names it authorises a
payment without any policy being consulted.

We proved this on testnet: with a `Default` rule present alongside a 100 XLM/day
spending rule, a **1000 XLM transfer succeeded**. See ADR-0003.

This is the difference between a budget that is enforced and a budget that merely
appears on screen.

## What done looks like

Either:

- a check that refuses to consider an account configured if it holds a `Default`
  rule alongside a budget rule, with a clear error naming the offending rule, or
- a documented, tested setup procedure that removes or restricts the `Default`
  rule, plus the same check as a guard

Whichever is chosen, a test must demonstrate the failure it prevents: a transfer
that exceeds the budget is refused with `3221`, on an account configured by this
project's own procedure.

## Notes

- The refusal path (`3221 SpendingLimitExceeded`) has **never been observed from a
  real transfer** in this project. That is a gap, not a detail.
- Related: the client must pin the context rule rather than accepting whatever
  rule matches. Same root cause, different side of the wire.

## Where

- `src/budget/install.ts`
- `docs/adr/0003-the-budget-rule-must-be-the-only-authority.md`
