# A headless path to configure a smart account

**Complexity: High (200 points)**

## Why

Every account-administration path in `smart-account-kit` is passkey-signed.
`createWallet` fails outright outside a browser:

```
createWallet FAILED: Error | WebAuthn is not supported in this browser
```

That makes the project's own setup impossible to run in CI, and impossible for
anyone without a browser and a platform authenticator.

## What done looks like

One of:

- **preferred** — a supported path in the upstream kit for a non-passkey signer
  to administer an account, which this project then uses
- a documented, tested virtual authenticator used **only in tests**, clearly
  labelled as test infrastructure and never shipped in the runtime path
- an alternative account-initialisation path that does not require a passkey

Whichever is chosen, the reasoning belongs in an ADR: the project's whole claim
is that the budget is enforced cryptographically, and a fake passkey anywhere
near that claim needs justifying in writing.

## Where

- `docs/adr/`
- `tests/` support code
