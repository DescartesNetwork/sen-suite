import { web3 } from '@coral-xyz/anchor'
import BN from 'bn.js'
import {
  MintActionState,
  MintActionStates,
  PRECISION,
  isAddress,
} from '@sentre/senswap'
import isEqual from 'react-fast-compare'

import { ZERO, undecimalize } from './decimals'
import { type ExtendedPoolData } from '@/providers/pools.provider'

export type Hop = {
  poolAddress: string
  bidMintAddress: string
  askMintAddress: string
}

export function isValidAction(
  allows: MintActionState[],
  target?: MintActionState,
) {
  if (!target) return false
  const index = allows.findIndex((action) => isEqual(action, target))
  return index >= 0
}

/**
 * Extract mint related data in a pool
 * @param mintAddress Mint Address
 * @param pool The pool
 * @returns
 */
export function findSideByMintAddress(
  mintAddress: string,
  pool: ExtendedPoolData,
) {
  const index = pool.mints.findIndex((mint) => mint.toBase58() === mintAddress)
  if (index < 0) return undefined
  return {
    mint: pool.mints[index],
    weight: pool.weights[index].toNumber(),
    reserve: pool.reserves[index],
    action: pool.actions[index],
  }
}

/**
 * Simulate a swap
 * @param opts Input params
 * @param opts.inAmount Input amount
 * @param opts.bidMint Bidding mint
 * @param opts.askMint Asked mint
 * @param opts.pool The liquidity pool
 * @returns
 */
export function simulateSwap({
  inAmount,
  bidMint,
  askMint,
  pool,
}: {
  inAmount: BN
  bidMint: string
  askMint: string
  pool: ExtendedPoolData
}) {
  const { reserve: bidReserve, weight: bidWeight } =
    findSideByMintAddress(bidMint, pool) || {}
  const { reserve: askReserve, weight: askWeight } =
    findSideByMintAddress(askMint, pool) || {}
  if (!bidReserve || !askReserve || !bidWeight || !askWeight)
    throw new Error('Invalid swap simulation data.')
  // Precision
  const precision = new BN(PRECISION)
  // Fee & Tax
  const fee = pool.fee.add(pool.tax).mul(inAmount).div(precision)
  // Remaining amount
  const remaining = inAmount.sub(fee)
  // Next bid reserve
  const nextBidReserve = bidReserve.add(remaining)
  // Weight ratio
  const wr = bidWeight / askWeight
  const r =
    (Number(undecimalize(bidReserve, 9)) /
      Number(undecimalize(nextBidReserve, 9))) **
    wr
  // Ask amount
  const nextAskReserve = new BN(r * PRECISION).mul(askReserve).div(precision)
  const askAmount = askReserve.sub(nextAskReserve)

  return {
    askAmount,
    fee: { amount: fee, mint: new web3.PublicKey(bidMint) },
    bidReserve,
    askReserve,
  }
}

/**
 * Find all possible routes from bidding mint to asked mint
 * @param opts Input params
 * @param opts.bidMint Bid mint
 * @param opts.askMint Ask mint
 * @param opts.pools All pools
 * @param opts.maxHops The maximum number of hops
 * @returns
 */
export function findAvailableRoutes({
  bidMint,
  askMint,
  pools,
  maxHops = 3,
}: {
  bidMint: web3.PublicKey
  askMint: web3.PublicKey
  pools: ExtendedPoolData[]
  maxHops?: number
}) {
  if (maxHops < 1)
    throw new Error('The number of hop must be greater than or equal to 1.')

  // The result array
  const result: Hop[][] = []

  // A utility to find pools that contain your desired mint
  function findAvailablePools(
    mintAddr: string,
    pools: ExtendedPoolData[],
    excluding: string[] = [],
  ) {
    const re: Hop[] = []
    pools.forEach((pool) => {
      const { mint: bidMint, action: bidAction } =
        findSideByMintAddress(mintAddr, pool) || {}
      if (
        isAddress(bidMint) &&
        isValidAction(
          [MintActionStates.Active, MintActionStates.BidOnly],
          bidAction,
        )
      )
        pool.mints
          .filter((mint) => mint.toBase58() !== mintAddr)
          .forEach((mint) => {
            const { mint: askMint, action: askAction } =
              findSideByMintAddress(mint.toBase58(), pool) || {}
            if (
              isAddress(askMint) &&
              isValidAction(
                [MintActionStates.Active, MintActionStates.AskOnly],
                askAction,
              )
            )
              re.push({
                poolAddress: pool.address,
                bidMintAddress: bidMint.toBase58(),
                askMintAddress: mint.toBase58(),
              })
          })
    })
    return re.filter(({ poolAddress }) => !excluding.includes(poolAddress))
  }
  // First, we push all the start pools
  let routes: Hop[][] = findAvailablePools(bidMint.toBase58(), pools).map(
    (hop) => [hop],
  )
  // For every start pool, we compute its possible routes.
  // Keep running if still there is an unsolved route
  while (routes.length) {
    // Filter routes that exceed max hops condition
    routes = routes.filter((route) => {
      const { askMintAddress } = route[route.length - 1]
      // It's a solution. Take it out and push to the result.
      if (askMintAddress === askMint.toBase58()) {
        result.push(route)
        return false
      }
      // Bad solution. Eliminate it!
      if (route.length >= maxHops) return false
      // Unsolved routes. Keep it!
      return true
    })
    // Move the current unsolved routes to it's next possible hops
    const cache: Hop[][] = []
    routes.forEach((route) => {
      const { askMintAddress } = route[route.length - 1]
      const availablePools = findAvailablePools(
        askMintAddress,
        pools,
        route.map(({ poolAddress }) => poolAddress),
      )
      availablePools.forEach((hop) => cache.push([...route, hop]))
    })
    // Reassign the cache (aka new possible routes) to the routes
    routes = cache
  }

  return result
}

/**
 * Find the best route based on all available routes
 * @param opts Input params
 * @param opts.inAmount Input amount
 * @param opts.availableRoutes Available routes
 * @param opts.pools All pools
 * @returns
 */
export type SenswapBestRoute = {
  bestAmount: BN
  bestRoute: Hop[]
  bestFees: Array<{ amount: BN; mint: web3.PublicKey }>
}
export function findTheBestRoute({
  inAmount,
  availableRoutes,
  pools,
}: {
  inAmount: BN
  availableRoutes: Hop[][]
  pools: ExtendedPoolData[]
}): SenswapBestRoute {
  let bestAmount: BN = ZERO
  let bestRoute: Hop[] = []
  let bestFees: Array<{ amount: BN; mint: web3.PublicKey }> = []

  availableRoutes.forEach((route) => {
    let amount = inAmount
    const fees: Array<{ amount: BN; mint: web3.PublicKey }> = []
    route.forEach(({ bidMintAddress, askMintAddress, poolAddress }) => {
      const pool = pools.find(({ address }) => poolAddress === address)
      if (!pool) return (amount = ZERO)
      const { askAmount, fee } = simulateSwap({
        inAmount: amount,
        bidMint: bidMintAddress,
        askMint: askMintAddress,
        pool,
      })
      amount = askAmount
      fees.push(fee)
    })
    // Reassign the best route
    if (amount.gt(bestAmount)) {
      bestAmount = amount
      bestRoute = route
      bestFees = fees
    }
  })
  return {
    bestAmount,
    bestRoute,
    bestFees,
  }
}
