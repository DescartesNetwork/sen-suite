import { useCallback, useEffect, useMemo } from 'react'
import { useAsync } from 'react-use'
import axios from 'axios'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { VersionedTransaction } from '@solana/web3.js'
import { Address, BN } from '@coral-xyz/anchor'
import isEqual from 'react-fast-compare'
import { MintActionStates, PoolData } from '@sentre/senswap'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { env } from '@/configs/env'
import { isAddress } from '@/helpers/utils'
import { useMintByAddress } from '@/providers/mint.provider'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { usePools } from '@/providers/pools.provider'
import { usePoolsTvl } from '@/providers/stat.provider'

export enum JupiterSwapMode {
  ExactIn = 'ExactIn',
  ExactOut = 'ExactOut',
}
export type JupiterFee = {
  amount: string
  mint: string
  pct: number
}
export type JupiterRouteInfo = {
  contextSlot: number
  inAmount: string
  inputMint: string
  otherAmountThreshold: string
  outAmount: string
  outputMint: string
  platformFee: unknown | null
  priceImpactPct: string
  slippageBps: number
  swapMode: JupiterSwapMode
  routePlan: Array<{
    percent: number
    swapInfo: {
      ammKey: string
      feeAmount: string
      feeMint: string
      inAmount: string
      inputMint: string
      label: string
      outAmount: string
      outputMint: string
    }
  }>
  timeTaken: number
}
export type SenSwapRouteInfo = {
  pool: string
  bidMint: string
  bidAmount: BN
  askMint: string
  askAmount: BN
  priceImpact: number
}
export type MintRoutes = {
  [mintAddress: string]: { [mintAddress: string]: Address[] }
}

export type SwapStore = {
  bidMintAddress: string
  setBidMintAddress: (bidMintAddress: string) => void
  bidAmount: string
  setBidAmount: (bidAmount: string) => void
  askMintAddress: string
  setAskMintAddress: (askMintAddress: string) => void
  askAmount: string
  setAskAmount: (askAmount: string) => void
  slippage: number
  setSlippage: (slippage: number) => void
  bestRoute: JupiterRouteInfo | undefined
  setBestRoute: (bestRoute: JupiterRouteInfo | undefined) => void
  allSenSwapRoutes: MintRoutes
  setAllSenSwapRoutes: (allRoutes: MintRoutes) => void
}

/**
 * Store
 */

export const useSwapStore = create<SwapStore>()(
  devtools(
    (set) => ({
      bidMintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      setBidMintAddress: (bidMintAddress: string) =>
        set({ bidMintAddress }, false, 'setBidMintAddress'),
      bidAmount: '',
      setBidAmount: (bidAmount: string) =>
        set({ bidAmount }, false, 'setBidAmount'),
      askMintAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
      setAskMintAddress: (askMintAddress: string) =>
        set({ askMintAddress }, false, 'setAskMintAddress'),
      askAmount: '',
      setAskAmount: (askAmount: string) =>
        set({ askAmount }, false, 'setAskAmount'),
      slippage: 0.01,
      setSlippage: (slippage: number) =>
        set({ slippage }, false, 'setSlippage'),
      bestRoute: undefined,
      setBestRoute: (bestRoute: JupiterRouteInfo | undefined) =>
        set({ bestRoute }, false, 'setRoutes'),
      allSenSwapRoutes: {},
      setAllSenSwapRoutes: (allSenSwapRoutes: MintRoutes) =>
        set({ allSenSwapRoutes }, false, 'setAllSenSwapRoutes'),
    }),
    {
      name: 'swap',
      enabled: env === 'development',
    },
  ),
)

/**
 * Hooks
 */

export const useSwitch = () => {
  const bidMintAddress = useSwapStore(({ bidMintAddress }) => bidMintAddress)
  const setBidMintAddress = useSwapStore(
    ({ setBidMintAddress }) => setBidMintAddress,
  )
  const setBidAmount = useSwapStore(({ setBidAmount }) => setBidAmount)
  const askMintAddress = useSwapStore(({ askMintAddress }) => askMintAddress)
  const setAskMintAddress = useSwapStore(
    ({ setAskMintAddress }) => setAskMintAddress,
  )
  const setAskAmount = useSwapStore(({ setAskAmount }) => setAskAmount)

  const onSwitch = useCallback(() => {
    setBidMintAddress(askMintAddress)
    setAskMintAddress(bidMintAddress)
    setBidAmount('')
    setAskAmount('')
  }, [
    bidMintAddress,
    setBidMintAddress,
    setBidAmount,
    askMintAddress,
    setAskMintAddress,
    setAskAmount,
  ])

  return onSwitch
}

export const useUnsafeSwap = () => {
  const bidMintAddress = useSwapStore(({ bidMintAddress }) => bidMintAddress)
  const bidAmount = useSwapStore(({ bidAmount }) => bidAmount)
  const askMintAddress = useSwapStore(({ askMintAddress }) => askMintAddress)
  const setAskAmount = useSwapStore(({ setAskAmount }) => setAskAmount)
  const slippage = useSwapStore(({ slippage }) => slippage)
  const setBestRoute = useSwapStore(({ setBestRoute }) => setBestRoute)

  const { decimals: bidDecimals } = useMintByAddress(bidMintAddress) || {
    decimals: 0,
  }
  const { decimals: askDecimals } = useMintByAddress(askMintAddress) || {
    decimals: 0,
  }

  const { value: bestRoute, loading } = useAsync(async () => {
    if (!isAddress(bidMintAddress) || !isAddress(askMintAddress) || !bidAmount)
      return undefined
    const amount = decimalize(bidAmount, bidDecimals).toString()
    const { data } = await axios.get<JupiterRouteInfo>(
      `https://quote-api.jup.ag/v6/quote?inputMint=${bidMintAddress}&outputMint=${askMintAddress}&amount=${amount}&slippageBps=${
        slippage * 10000
      }`,
    )
    return data
  }, [bidMintAddress, bidAmount, askMintAddress, slippage, bidDecimals])

  useEffect(() => {
    const { outAmount } = bestRoute || {}
    if (!outAmount) setAskAmount('')
    else setAskAmount(undecimalize(new BN(outAmount), askDecimals))
    setBestRoute(bestRoute)
  }, [bestRoute, setBestRoute, setAskAmount, askDecimals])

  return { bestRoute, fetching: loading }
}

export const useSwap = () => {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const bestRoute = useSwapStore(({ bestRoute }) => bestRoute)

  const swap = useCallback(async () => {
    if (!publicKey || !signTransaction || !connection)
      throw new Error('Cannot connect wallet.')
    if (!bestRoute) throw new Error('Invalid input.')
    const {
      data: { swapTransaction },
    } = await axios.post('https://quote-api.jup.ag/v6/swap', {
      quoteResponse: bestRoute,
      userPublicKey: publicKey.toBase58(),
      wrapUnwrapSOL: true,
    })
    if (!swapTransaction) throw new Error('Cannot find routes.')
    const buf = Buffer.from(swapTransaction, 'base64')
    const tx = VersionedTransaction.deserialize(buf)
    const signedTx = await signTransaction(tx)
    const raw = signedTx.serialize()
    const txId = await connection.sendRawTransaction(raw, {
      skipPreflight: true,
      maxRetries: 2,
    })
    return txId
  }, [bestRoute, publicKey, signTransaction, connection])

  return { bestRoute, swap }
}

export const useAllRoutes = () => {
  const pools = usePools()
  const poolsTvl = usePoolsTvl()

  // Get pools tvl > 1000$
  const validPools = useMemo(() => {
    const minTvl = 1000
    const result: Record<string, PoolData> = {}
    for (const addr in pools) {
      const poolData = pools[addr]

      if (poolData.reserves.map((val) => val.toString()).includes('0')) continue
      const tvl = poolsTvl[addr] || 0
      if (tvl < minTvl) continue
      result[addr] = poolData
    }
    return result
  }, [pools, poolsTvl])

  // Generate available routes in sen swap
  const allRoutes = useMemo(() => {
    const mintRoutes: MintRoutes = {}
    for (const address in validPools) {
      const { mints, actions } = validPools[address]
      const mintAddresses = mints.map((mint) => mint.toBase58())

      for (let i = 0; i < mintAddresses.length; i++) {
        if (!isEqual(actions[i], MintActionStates.Active)) continue
        for (let j = 0; j < mintAddresses.length; j++) {
          if (!isEqual(actions[j], MintActionStates.Active)) continue

          const bidMint = mintAddresses[i]
          const askMint = mintAddresses[j]

          if (bidMint === askMint) continue

          if (!mintRoutes[bidMint]) mintRoutes[bidMint] = {}
          if (!mintRoutes[bidMint][askMint]) mintRoutes[bidMint][askMint] = []
          mintRoutes[bidMint][askMint].push(address)
        }
      }
    }
    return mintRoutes
  }, [validPools])

  return allRoutes
}

type RouteInfo = {
  pool: Address
  bidMint: string
  askMint: string
}
export const useRoutes = () => {
  const allRoutes = useAllRoutes()
  const bidMintAddress = useSwapStore(({ bidMintAddress }) => bidMintAddress)
  const askMintAddress = useSwapStore(({ askMintAddress }) => askMintAddress)

  const isValidRoute = (route: RouteInfo[]) => {
    const pools = new Set()
    const mintPairs = new Set()

    for (const { pool, askMint, bidMint } of route) {
      // Check duplicate pools
      if (pools.has(pool)) return false
      pools.add(pool)

      const mintPair = bidMint + '-' + askMint
      const reverseMintPair = askMint + '-' + bidMint
      // Check duplicate bidMint && askMint
      if (mintPairs.has(reverseMintPair)) return false
      mintPairs.add(mintPair)
    }
    return true
  }

  const getAvailRoutes = useCallback(
    (bidMint: string, askMint: string, deep = 1) => {
      if (deep > 3) return []

      const routesFromBid = allRoutes[bidMint]
      if (!routesFromBid) return []

      const pools = routesFromBid[askMint] || []
      const routes: Array<RouteInfo[]> = pools.map((pool) => {
        return [{ pool, bidMint, askMint }]
      })

      for (const nextMint in routesFromBid) {
        const nextPools = routesFromBid[nextMint]
        const nextDeep = deep + 1
        const nextRoutes = getAvailRoutes(nextMint, askMint, nextDeep)

        nextRoutes.forEach((route) => {
          nextPools.forEach((pool) => {
            const newRoute = [{ pool, bidMint, askMint: nextMint }, ...route]
            if (isValidRoute(newRoute)) routes.push(newRoute)
          })
        })
      }
      return routes
    },

    [allRoutes],
  )

  const { value: availRoutes, loading } = useAsync(
    async () => await getAvailRoutes(bidMintAddress, askMintAddress),
    [bidMintAddress, askMintAddress, getAvailRoutes],
  )

  return { availRoutes: availRoutes || [], loading }
}
