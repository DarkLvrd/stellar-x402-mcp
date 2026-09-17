# Proving the budget on testnet

This is the evidence for the one claim this project makes: **a contract, not our code, refuses an overspend.**

> **Status: the mechanism works; our configuration did not.** A run on 2026-09-16
> discovered that a budget can be bypassed entirely when the account also holds
> an unrestricted `Default` rule. See [ADR-0003](adr/0003-the-budget-rule-must-be-the-only-authority.md)
> and the results section below. **Step 5 has not yet been observed passing.**

Automating this is deliberately left as a Wave issue. Doing it by hand first is how we know what to automate — and this run is the proof of that.

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

## Steps

### 1. Create and connect the account

Open the demo and create a wallet. Your browser will ask for a passkey — accept it. This deploys a smart account contract on testnet.

**Record the account address.** It starts with `C`.

### 2. Fund the account

Use the demo's fund action (Friendbot, testnet only).

### 3. Attach the budget

Build a context rule:

- **Context:** `CallContract`
- **Contract:** the native XLM token above
- **Signer:** add the passkey — **click "Add" after selecting it.** Selecting it in the dropdown is not enough; a rule with policies but no signers cannot authorise anything.
- **Policy:** spending limit → the policy contract above, **limit 100**, **period 1 day**

The rule **must** be `CallContract`. The policy refuses to install on a `Default` rule — contract code `3227`, `OnlyCallContractAllowed`.

### 4. Remove any unrestricted rule

**This step was missing, and its absence invalidated the first run.**

If the account still holds its original `Default (Any Operation)` rule, the client may authorise a transfer under *that* rule, and the budget is never consulted. Remove it, or confirm there is no remaining path that matches the transfer.

### 5. Spend inside the budget

Transfer **50 XLM**. Expect **success**.

### 6. Spend outside the budget

Transfer **1000 XLM**. Expect **refusal**, with `SpendingLimitExceeded` (code `3221`).

## Results — 2026-09-16

Run by hand in Chrome on macOS.

| Step | Outcome |
|---|---|
| 1. Create account | ✅ `CCWYRC7ZS6OZZEKYYF6TMK2VFPV63PBISWAYRYNO3YBXEKION4ZMJZ2R`, deploy tx `f852b6e33ea65fd133fd…` |
| 2. Fund | ✅ tx `18a9ea3adfb95da559d9…`, 9995.00 XLM |
| 3. Attach budget | ✅ rule `#1`, `Call Contract: CDLZ…CYSC`, 1 policy — **but 0 signers** |
| 4. Remove unrestricted rule | ✅ rule `#0` removed |
| 5. 50 XLM inside budget | ✅ tx `ba96b680e73230e81459…` |
| 6. 1000 XLM outside budget | ❌ **succeeded** — tx `85782d351bc773663bd3…`. The budget was bypassed |

**What the failure taught us**

The 1000 XLM transfer succeeded while rule `#0` still existed. Rule `#1` had no signers, so it could not have authorised anything. The transfer must therefore have been authorised under the unrestricted `Default` rule.

The policy was never consulted. Not a bug — a rule the client was entitled to choose.

That is why this project's claim needs a stronger configuration requirement than "install a spending limit", and why step 4 now exists.

## Evidence to keep

| Item | Why |
|---|---|
| Smart account address (`C…`) | Identifies the account on a block explorer |
| Hash of the 50 XLM transfer | Proves a payment succeeded under the budget |
| Error from the 1000 XLM attempt | Proves the contract refused it, with a named code |
| A screenshot of the final state | Fastest thing for a reviewer to read |

## Known difficulties

- The passkey prompt must be answered while it is on screen; several attempts timed out first. Bring the browser window to the front before starting.
- The hosted indexer timed out once and reported a stored wallet as incompatible. Creating a fresh wallet was the fix.
- User verification (UV) failed on one attempt — `The authenticator User Verified (UV) flag was not set`. It succeeded on a later attempt with no change, so treat it as flaky rather than broken.

## If something fails

- **`OnlyCallContractAllowed` on step 3** — the rule is not `CallContract`. Expected; fix the scope.
- **`SmartAccountNotInstalled` (3220)`** — the policy did not attach to *this* rule. Policies are keyed by `(smart account, context rule id)`.
- **`HistoryCapacityExceeded` (3224)** — the policy's spending history filled up. Raise the period, or start with a fresh rule.
- **`No WebAuthn signer found for credential ID …`** — the rule has policies but no signers. Add the signer.

Both of the first two are already decoded for you by `refusalFromCode`.

## After this works

Update the **Status** section of the README from *"one real testnet payment through the cap"* to done, and paste the two hashes. Then open the Wave issue to automate it: the same steps, driven headlessly, in CI.
