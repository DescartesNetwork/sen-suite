type Theme = 'light' | 'dark'

type ChainId = 101 | 102 | 103

/**
 * Academy
 */

type PageMetadata = {
  title: string
  publishedAt: number
  tags: string[]
  description: string
  thumbnail: string
  pinned: boolean
}

type PageMap = Record<string, PageMetadata>

/**
 * Swap
 */

type MintMetadata = {
  address: string
  chainId: ChainId
  decimals: number
  name: string
  symbol: string
  logoURI: string
  tags: string[]
  extensions: {
    coingeckoId?: string
  }
}

type JupAgPriceMetadata = {
  data: Record<
    string,
    {
      id: string
      mintSymbol: string
      vsToken: string
      vsTokenSymbol: string
      price: number
    }
  >
  timeTaken: number
}

type JupAgQuoteMetadata = {
  contextSlot: number
  inAmount: string
  inputMint: string
  otherAmountThreshold: string
  outAmount: string
  outputMint: string
  platformFee: { amount: string; feeBps: number } | null
  priceImpactPct: string
  routePlan: Array<{
    percent: number
    swapInfo: {
      ammKey: string
      feeAmount: string
      feeMint: string
      inAmount: string
      inputMint: string
      outAmount: string
      outputMint: string
      label: string
    }
  }>
  slippageBps: number
  swapMode: 'ExactIn' | 'ExactOut'
  timeTaken: number
}

type JupAgSwapMetadata = {
  lastValidBlockHeight: number
  prioritizationFeeLamports: number
  swapTransaction: string
}
