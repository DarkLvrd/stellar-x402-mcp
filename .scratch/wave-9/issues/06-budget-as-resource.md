# Expose the budget as an MCP resource

**Complexity: Medium (150 points)**

## Why

The budget is context, not an action. MCP clients can pull resources into an
agent's context automatically; today the agent has to decide to call a tool to
learn its own limits.

## What done looks like

The budget is available as a resource at a stable URI, alongside the existing
`get_budget` tool. Both must agree — a test should assert the resource body and
the tool output cannot diverge.

## Where

- `src/server.ts`
- `tests/server.test.ts`
