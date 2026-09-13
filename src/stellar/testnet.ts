/**
 * The testnet addresses this project builds against.
 *
 * Network facts are data, held in one place, for the same reason the selector
 * lookups in agentic-linkedin are data: a wrong address should be wrong in
 * exactly one place, and swapping networks should not mean editing logic.
 *
 * Source: `smart-account-kit` demo configuration, Protocol 27 testnet
 * deployments — https://github.com/stellar/smart-account-kit
 */
export const TESTNET = {
  /** CAIP-2 identifier, as x402 names networks. */
  caip2: "stellar:testnet",
  rpcUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: "Test SDF Network ; September 2015",
  /** Circle's USDC on Stellar testnet, as a SEP-41 contract. */
  usdc: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  /** WASM hash of the smart account contract, for deployment. */
  accountWasmHash: "1b5f4534a76322da2ad7c745f6900857a6802b0ca79850c35a03561df997785a",
  /** Required by the kit even when only Ed25519 signers are used. */
  webauthnVerifier: "CC7EKIHQP3TN4CARQDND6CEOY2UXLWWC2X5GHTD5NLAT7BG5GPZIOM3F",
  /** Validates the agent's Ed25519 key. */
  ed25519Verifier: "CAAVTMCBXEIBPR64EAASKFXERVPYFZA2JYP5A3BG6PESWEFUJX5IHKN4",
  /** Enforces the budget. */
  spendingLimitPolicy: "CABXBYJNZ7IUW4G3D6BND5YCAQF3ASSDMDAOKQQ63UYFSO7WUU2TIP5G",
  /** Native XLM, for funding an account on testnet. */
  nativeToken: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  /** Sponsors fees for testnet transactions. */
  relayerUrl: "https://smart-account-relayer-proxy.sdf-ecosystem.workers.dev",
} as const;

export type TestnetAddresses = typeof TESTNET;
