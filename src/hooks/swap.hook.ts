import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAsync, useDebounce } from 'react-use'
import isEqual from 'react-fast-compare'
import axios from 'axios'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { VersionedTransaction, PublicKey } from '@solana/web3.js'
import { WRAPPED_SOL_MINT } from '@metaplex-foundation/js'
import { Address, BN } from '@coral-xyz/anchor'
import { MintActionStates, PoolData } from '@sentre/senswap'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { env } from '@/configs/env'
import { isAddress } from '@/helpers/utils'
import { useMintByAddress } from '@/providers/mint.provider'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { usePools } from '@/providers/pools.provider'
import { usePoolsTvl } from '@/providers/stat.provider'
import { useOracles, useSenswap, useWrapSol } from './pool.hook'
import { useInitMultiTokenAccount, useMints } from './spl.hook'

export enum Platform {
  SenSwap = 'SenSwap',
  Jup = 'Jupiter',
}

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
export type SwapInfo = {
  pool: string
  bidMint: string
  bidAmount: BN
  askMint: string
  askAmount: BN
  priceImpactPct: number
}
type RouteInfo = {
  pool: Address
  bidMint: string
  askMint: string
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
  const slippage = useSwapStore(({ slippage }) => slippage)

  const { decimals: bidDecimals } = useMintByAddress(bidMintAddress) || {
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

  return { bestRoute, fetching: loading }
}

export const useJupSwap = () => {
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
/**
 * SenSwap section
 */

/**  Generate available routes in sen swap
 *   @returns All routes
 */
export const useAllRoutes = () => {
  const pools = usePools()
  const poolsTvl = usePoolsTvl()

  // Get pools tvl > 1000$
  const validPools = useMemo(() => {
    const minTvl = 0
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

/** Get valid routes with bidAddress and askAddress
 *  @returns valid routes
 */

export const useRoutes = () => {
  const [availRoutes, setAvailRoutes] = useState<RouteInfo[][]>([])
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
    (bidMint: string, askMint: string, hop = 1) => {
      if (hop > 3) return []

      const routesFromBid = allRoutes[bidMint]
      if (!routesFromBid) return []

      const pools = routesFromBid[askMint] || []
      const routes: Array<RouteInfo[]> = pools.map((pool) => {
        return [{ pool, bidMint, askMint }]
      })

      for (const nextMint in routesFromBid) {
        const nextPools = routesFromBid[nextMint]
        const nextHop = hop + 1
        const nextRoutes = getAvailRoutes(nextMint, askMint, nextHop)

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

  useDebounce(
    async () => {
      const availRoutes = await getAvailRoutes(bidMintAddress, askMintAddress)
      setAvailRoutes(availRoutes)
    },
    300,
    [getAvailRoutes, setAvailRoutes, askMintAddress, bidMintAddress],
  )

  return { availRoutes: availRoutes || [] }
}
/** Get best route with bidAddress and askAddress
 *  @returns best route
 */
export const useBestRoutes = () => {
  const [routesInfo, setRoutesInfo] = useState<SwapInfo[][]>([])
  const { getMintInfo, calcOutGivenInSwap, calcPriceImpactSwap } = useOracles()
  const { availRoutes } = useRoutes()
  const pools = usePools()
  const bidMintAddress = useSwapStore(({ bidMintAddress }) => bidMintAddress)
  const bidAmount = useSwapStore(({ bidAmount }) => bidAmount)

  const { decimals: bidDecimals } = useMintByAddress(bidMintAddress) || {
    decimals: 0,
  }

  const allMintAddress = useMemo(() => {
    const mints: string[] = []
    availRoutes.forEach((routes) =>
      routes.forEach(({ askMint, bidMint }) => {
        mints.push(bidMint)
        mints.push(askMint)
      }),
    )
    return mints
  }, [availRoutes])
  const mintInfo = useMints(allMintAddress)
  const decimals = useMemo(() => {
    const mintDecimals: { [mintAddress: string]: number } = {}
    allMintAddress.forEach((mintAddress, i) => {
      mintDecimals[mintAddress] = mintInfo[i]?.decimals || 0
    })
    return mintDecimals
  }, [allMintAddress, mintInfo])

  // Calculate token out per route
  const fetchRoutesInfo = useCallback(async () => {
    if (!Number(bidAmount)) return []
    const senSwapInfoRoutes: Array<SwapInfo>[] = []

    for (const routes of availRoutes) {
      const route: SwapInfo[] = []
      const bidAmountBN = await decimalize(bidAmount, bidDecimals)

      for (const { askMint, bidMint, pool } of routes) {
        const poolData = pools[pool.toString()]
        const bidMintInfo = getMintInfo(poolData, new PublicKey(bidMint))
        const askMintInfo = getMintInfo(poolData, new PublicKey(askMint))

        const tokenOutAmount = calcOutGivenInSwap(
          bidAmountBN,
          askMintInfo.reserve,
          bidMintInfo.reserve,
          askMintInfo.normalizedWeight,
          bidMintInfo.normalizedWeight,
          poolData.fee,
        )

        const dataForSlippage = {
          balanceIn: bidMintInfo.reserve,
          balanceOut: askMintInfo.reserve,
          weightIn: bidMintInfo.normalizedWeight,
          weightOut: askMintInfo.normalizedWeight,
          decimalIn: decimals[bidMint],
          decimalOut: decimals[askMint],
          swapFee: poolData.fee.add(poolData.tax),
        }
        let priceImpact = calcPriceImpactSwap(bidAmountBN, dataForSlippage)
        if (priceImpact < 0) priceImpact = 0
        route.push({
          pool: pool.toString(),
          bidMint,
          askMint,
          bidAmount: bidAmountBN,
          askAmount: tokenOutAmount,
          priceImpactPct: priceImpact,
        })
      }
      senSwapInfoRoutes.push(route)
    }
    return senSwapInfoRoutes
  }, [
    bidAmount,
    availRoutes,
    bidDecimals,
    pools,
    getMintInfo,
    calcOutGivenInSwap,
    decimals,
    calcPriceImpactSwap,
  ])

  const bestSenSwapRoute = useMemo(() => {
    if (!routesInfo) return
    const sortedRoute = routesInfo.sort((routeA, routeB) => {
      const askAmountA = routeA[routeA.length - 1].askAmount
      const askAmountB: BN = routeB[routeB.length - 1].askAmount
      return askAmountB.gt(askAmountA) ? 1 : -1
    })
    const [bestRoute] = sortedRoute
    if (!bestRoute?.length)
      return {
        route: [],
        bidAmount,
        askAmount: '0',
        priceImpact: 0,
      }

    const askAmount = bestRoute[bestRoute.length - 1].askAmount.toString()
    const bestRouteInfo = bestRoute.map((value, idx) => {
      const poolData = pools[value.pool]
      return { ...bestRoute[idx], poolData }
    })
    const p = bestRouteInfo.reduce(
      (acc, elmInfo) => acc * (1 - elmInfo.priceImpactPct),
      1,
    )
    const newPriceImpact = 1 - p
    return {
      route: bestRoute,
      bidAmount,
      askAmount,
      priceImpactPct: newPriceImpact,
    }
  }, [bidAmount, pools, routesInfo])

  useDebounce(
    async () => {
      const routesInfo = await fetchRoutesInfo()
      setRoutesInfo(routesInfo)
    },
    300,
    [fetchRoutesInfo, setRoutesInfo],
  )

  return { bestSenSwapRoute }
}

/** Swap on senswap
 *  @returns swap function
 */
export const useSenSwap = () => {
  const bidAmount = useSwapStore(({ bidAmount }) => bidAmount)
  const slippage = useSwapStore(({ slippage }) => slippage)
  const bidMintAddress = useSwapStore(({ bidMintAddress }) => bidMintAddress)
  const askMintAddress = useSwapStore(({ askMintAddress }) => askMintAddress)
  const { decimals: askDecimals } = useMintByAddress(askMintAddress) || {
    decimals: 0,
  }
  const { decimals: bidDecimals } = useMintByAddress(bidMintAddress) || {
    decimals: 0,
  }
  const { bestSenSwapRoute } = useBestRoutes()
  const { createWrapSolTxIfNeed, createTxUnwrapSol } = useWrapSol()
  const senswap = useSenswap()
  const { publicKey } = useWallet()

  const initTxCreateMultiTokenAccount = useInitMultiTokenAccount()
  const initTokenAccountTxs = useCallback(async () => {
    if (!bestSenSwapRoute || !publicKey) return []
    const transactions = await initTxCreateMultiTokenAccount(
      bestSenSwapRoute.route.map((route) => route.askMint),
      publicKey,
    )
    return transactions
  }, [bestSenSwapRoute, initTxCreateMultiTokenAccount, publicKey])

  const swap = useCallback(async () => {
    if (!bestSenSwapRoute || !senswap.program.provider.sendAll) return ''
    const { askAmount, route } = bestSenSwapRoute

    const bidAmountBN = decimalize(bidAmount, bidDecimals)
    const rawAskAmount = undecimalize(new BN(askAmount), askDecimals)
    const limit = Number(rawAskAmount) * (1 - slippage / 100)
    const limitBN = await decimalize(limit.toString(), askDecimals)
    const transactions = await initTokenAccountTxs()
    const wrapSolTx = await createWrapSolTxIfNeed(
      new PublicKey(bidMintAddress),
      bidAmountBN,
    )
    if (wrapSolTx) transactions.push(wrapSolTx)
    const { tx } = await senswap.route({
      bidAmount: bidAmountBN,
      limit: limitBN,
      routes: route,
      sendAndConfirm: false,
    })
    transactions.push(tx)

    const askMint = new PublicKey(askMintAddress)
    if (askMint.equals(WRAPPED_SOL_MINT)) {
      const unwrapSolTx = await createTxUnwrapSol(askMint)
      transactions.push(unwrapSolTx)
    }

    const txIds = await senswap.program.provider.sendAll(
      transactions.map((tx) => {
        return { tx, signers: [] }
      }),
    )
    return txIds[txIds.length - 1]
  }, [
    askDecimals,
    askMintAddress,
    bestSenSwapRoute,
    bidAmount,
    bidDecimals,
    bidMintAddress,
    createTxUnwrapSol,
    createWrapSolTxIfNeed,
    initTokenAccountTxs,
    senswap,
    slippage,
  ])

  return { swap, bestSenSwapRoute }
}

export const useSwap = () => {
  const { swap: jubSwap } = useJupSwap()
  const { bestRoute, fetching } = useUnsafeSwap()
  const { bestSenSwapRoute, swap: senSwap } = useSenSwap()
  const setAskAmount = useSwapStore(({ setAskAmount }) => setAskAmount)
  const setBestRoute = useSwapStore(({ setBestRoute }) => setBestRoute)
  const askMintAddress = useSwapStore(({ askMintAddress }) => askMintAddress)
  const { decimals: askDecimals } = useMintByAddress(askMintAddress) || {
    decimals: 0,
  }
  const platform = useMemo(() => {
    if (!bestRoute || !bestSenSwapRoute) return

    const { outAmount: jupAmount } = bestRoute
    const { askAmount: senswapAmount } = bestSenSwapRoute
    const maxDiff = 0.05
    const difference = Math.abs(Number(jupAmount) - Number(senswapAmount))
    const isJup = difference > maxDiff * Number(jupAmount)

    if (isJup) return Platform.Jup
    return Platform.SenSwap
  }, [bestRoute, bestSenSwapRoute])

  const routes = useMemo(() => {
    if (!platform) return
    if (platform === Platform.Jup) return bestRoute
    return bestSenSwapRoute
  }, [bestRoute, bestSenSwapRoute, platform])

  const hops = useMemo(() => {
    if (!platform || !bestRoute || !bestSenSwapRoute) return []
    const hops: string[] = []
    if (platform === Platform.Jup) {
      bestRoute.routePlan.forEach(({ swapInfo: { inputMint, outputMint } }) => {
        hops.pop()
        hops.push(inputMint)
        hops.push(outputMint)
      })
    }

    if (platform === Platform.SenSwap) {
      bestSenSwapRoute.route.forEach(({ askMint, bidMint }) => {
        hops.pop()
        hops.push(bidMint)
        hops.push(askMint)
      })
    }
    return hops
  }, [bestRoute, bestSenSwapRoute, platform])

  const swap = useCallback(async () => {
    if (!platform) return ''
    if (platform === Platform.Jup) return jubSwap()
    return senSwap()
  }, [jubSwap, platform, senSwap])

  useEffect(() => {
    const { outAmount } = bestRoute || {}
    const { askAmount } = bestSenSwapRoute || {}

    if (!outAmount || !askAmount || !platform) setAskAmount('')
    else {
      const amount = platform === Platform.Jup ? outAmount : askAmount
      setAskAmount(undecimalize(new BN(amount), askDecimals))
    }
    setBestRoute(bestRoute)
  }, [
    bestRoute,
    setBestRoute,
    setAskAmount,
    askDecimals,
    bestSenSwapRoute,
    platform,
  ])

  return { platform, swap, routes, hops, fetching }
}
