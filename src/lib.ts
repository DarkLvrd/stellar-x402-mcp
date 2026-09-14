/**
 * The library surface, for callers who want the budget domain without the
 * server. The executable lives in `src/index.ts`.
 */
export * from "./budget/index.js";
export * from "./tools/index.js";
export { createServer } from "./server.js";
export { TESTNET, type TestnetAddresses } from "./stellar/testnet.js";
