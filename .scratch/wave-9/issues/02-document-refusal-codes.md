# Document every refusal code

**Complexity: Trivial (100 points)**

## Why

`explain_refusal` decodes eight `SpendingLimit` codes, and the README documents
none of them. A maintainer reading a failure should not have to read source to
find out what `3224` means.

## What done looks like

A README section listing each code the budget policy can raise, with:

- the code number and its contract name
- what it means in one sentence
- what to do about it

The authoritative source is `CONTRACT_ERROR_REGISTRY` from `smart-account-kit`,
filtered to the `SpendingLimit` family. A test should assert every documented
code exists in that registry, so the table cannot drift from the contract.

## Where

- `README.md`
- `tests/refusal-codes-documented.test.ts`
