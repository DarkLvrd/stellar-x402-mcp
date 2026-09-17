# Automate the testnet walkthrough

**Complexity: High (200 points)**

## Why

`docs/testnet-walkthrough.md` currently describes six manual browser steps. A
claim that can only be verified by hand will stop being verified.

## What done looks like

An integration test, runnable on demand, that on testnet:

1. deploys a smart account
2. attaches a spending-limit policy to a `CallContract` rule
3. makes a transfer inside the budget and asserts success
4. makes a transfer outside the budget and asserts **refusal with code 3221**

It must be skipped by default in CI (it needs network and funds) and runnable
with an explicit script.

## Blocked by

The headless setup problem — every account-administration path in
`smart-account-kit` is passkey-signed, so an account cannot currently be created
without a browser. See the project's upstream issue tracker. A solution to that
issue unblocks this one; until then this ticket is a spike, not a build.

## Where

- `tests/integration/walkthrough.test.ts`
- an `npm run test:testnet` script
