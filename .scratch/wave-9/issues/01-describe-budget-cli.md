# Describe-budget CLI

**Complexity: Trivial (100 points)**

## Why

A budget file can currently only be inspected by starting the MCP server and
calling `get_budget`. A human reviewing a budget before approving it should not
need an agent to read it back to them.

## What done looks like

A script that loads a budget file and prints the same summary `describeBudget`
produces:

```bash
npm run describe-budget -- examples/budget.testnet.json
```

- exits `0` and prints the summary for a valid file
- exits non-zero with a clear message naming the file and the offending field for an invalid one
- covered by tests, including the invalid path

## Where

- `src/cli/describe-budget.ts`
- a `describe-budget` script in `package.json`
- `tests/describe-budget-cli.test.ts`
