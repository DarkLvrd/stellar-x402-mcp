# Append-only audit log of budget decisions

**Complexity: Medium (150 points)**

## Why

The point of a budget is that a human can find out what the agent asked for.
Right now nothing is written down: a refusal explains itself and then vanishes.

## What done looks like

Every budget load, spend check, and refusal is appended to a JSONL file, one
event per line, with:

- ISO timestamp
- event type
- the amount, the outcome, and for refusals the contract code

Rules:

- **append only** — never rewrite or truncate an existing file
- **never write a secret** — there are no secrets in this path, and the test
  should prove one cannot leak through
- a rotation or size cap, so a long-running agent cannot fill a disk

## Where

- `src/audit/log.ts`
- wired into `src/server.ts`
- `tests/audit-log.test.ts`
