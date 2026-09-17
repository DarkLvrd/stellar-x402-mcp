# Wave 9 backlog

Draft issues for the Stellar Wave 9 application. **Not yet posted to GitHub.**

The complexity tags are the Drips points tiers: Trivial 100, Medium 150, High 200.
Every issue must be completable inside one 7-day Wave.

| # | Issue | Tier | Blocked? |
|---|---|---|---|
| 01 | Describe-budget CLI | Trivial 100 | — |
| 02 | Document every refusal code | Trivial 100 | — |
| 03 | Prove the testnet guard is total | Trivial 100 | — |
| 04 | `check_spend` and the rolling window | Medium 150 | — |
| 05 | Append-only audit log | Medium 150 | — |
| 06 | Budget as an MCP resource | Medium 150 | — |
| 07 | Read settlement receipts | Medium 150 | — |
| 08 | Automate the testnet walkthrough | High 200 | headless setup |
| 09 | Wire the `pay` tool to x402 | High 200 | upstream signing |
| 10 | Headless setup path | High 200 | — |
| 11 | Ensure no unrestricted rule | High 200 | — |

## Before posting

- [ ] Read every issue and change anything that does not sound like you
- [ ] Confirm no issue requires knowledge a new contributor would not have
- [ ] Decide whether 08 and 09 go up now or stay drafted until unblocked

Two blocked tickets is honest — they are the real, hard work — but a contributor
who picks one up and cannot start will not come back. Consider posting 01–07, 10 and
11 first, and holding 08–09 until their blockers clear. Issue 11 is not blocked and
is arguably the most important ticket in the list — it came out of a real testnet
failure (ADR-0003).
