# Proving the budget on testnet

This is the evidence for the one claim this project makes: **a contract, not our code, refuses an overspend.** It takes about ten minutes, and a reviewer can repeat it.

Automating this is deliberately left as a Wave issue. Doing it by hand first is how we know what to automate.

## Why XLM, not USDC

The budget policy is **asset-agnostic** — it counts amounts, and the rule it is attached to supplies the scope. So the *same* mechanism that will govern USDC governs the native token, and using XLM avoids a testnet USDC trustline and faucet detour that would prove nothing extra.

USDC later is a change of two contract ids, not a change of mechanism.

## Prerequisites

- A browser that supports passkeys (Chrome, Safari, Firefox)
- Nothing else. Testnet is free

## Addresses used

| What | Value |
|---|---|
| Demo | https://smart-account-kit.pages.dev/ |
| Native XLM token (SEP-41) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Spending-limit policy | `CABXBYJNZ7IUW4G3D6BND5YCAQF3ASSDMDAOKQQ63UYFSO7WUU2TIP5G` |
| Network | `stellar:testnet` |

These are the same values as `src/stellar/testnet.ts`, which CI checks are well-formed.

> The demo's panel names below are taken from its source. Visible labels may differ slightly.

## Steps

### 1. Create and connect the account

Open the demo and create a wallet. Your browser will ask for a passkey — accept it. This deploys a smart account contract on testnet.

**Record the account address.** It starts with `C`.

### 2. Fund the account

Use the demo's fund action. It uses Friendbot, which only works on testnet. You should end up with testnet XLM in the smart account.

### 3. Attach the budget

Build a context rule:

- **Context:** `CallContract`
- **Contract:** the native XLM token above
- **Signer:** the passkey you created
- **Policy:** spending limit → the policy contract above, **limit 100**, **period 1 day**

The rule **must** be `CallContract`. The policy refuses to install on a `Default` rule — contract code `3227`, `OnlyCallContractAllowed`. If you try, you will get that error, and this repository treats that error as a named refusal rather than a mystery.

### 4. Spend inside the budget

Transfer **50 XLM**. Expect **success**.

**Record the transaction hash.**

### 5. Spend outside the budget

Transfer **1000 XLM**. Expect **refusal**, with `SpendingLimitExceeded` (code `3221`).

**Record the error message.**

This is the entire point. Step 4 proves the account can pay. Step 5 proves the limit is not advice.

## Evidence to keep

| Item | Why |
|---|---|
| Smart account address (`C…`) | Identifies the account on a block explorer |
| Hash of the 50 XLM transfer | Proves a payment succeeded under the budget |
| Error from the 1000 XLM attempt | Proves the contract refused it, with a named code |
| A screenshot of the final state | Fastest thing for a reviewer to read |

## If something fails

- **`OnlyCallContractAllowed` on step 3** — the rule is not `CallContract`. Expected; fix the scope.
- **`SmartAccountNotInstalled` (3220) on step 4** — the policy did not attach to *this* rule. Policies are keyed by `(smart account, context rule id)`.
- **`HistoryCapacityExceeded` (3224)** — the policy's spending history filled up. Raise the period, or start with a fresh rule.

Both of the first two are already decoded for you by `refusalFromCode`.

## After this works

Update the **Status** section of the README from *"one real testnet payment through the cap"* to done, and paste the two hashes. Then open the Wave issue to automate it: the same six steps, driven headlessly, in CI.
