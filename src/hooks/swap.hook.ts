import { useCallback, useMemo, useState } from 'react'
import axios from 'axios'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN, web3 } from '@coral-xyz/anchor'
import { isAddress } from '@sentre/senswap'
import { useAsync, useDebounce } from 'react-use'
import { type AsyncState } from 'react-use/lib/useAsyncFn'

import { useMints, useMintByAddress } from '@/providers/mint.provider'
import { ZERO, decimalize, undecimalize } from '@/helpers/decimals'
import { ExtendedPoolData, useActivePools } from '@/providers/pools.provider'
import { useSenswap } from './pool.hook'
import { useSwapStore } from '@/providers/swap.provider'
import {
  type Hop,
  type SenswapBestRoute,
  findAvailableRoutes,
  findSideByMintAddress,
  findTheBestRoute,
} from '@/helpers/oracle'
import { WRAPPED_SOL, useUnwrap, useWrap } from './wsol.hook'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { useLamports } from '@/providers/wallet.provider'
import { confirmTransaction } from '@/helpers/explorers'

/**
 * Extract mint decimals
 * @param mintAddress Mint address
 * @param mints Mints
 * @returns
 */
function getMintDecimals(mintAddress: string, mints: MintMetadata[]) {
  if (!isAddress(mintAddress)) return 0
  const { decimals = 0 } =
    mints.find(({ address }) => address === mintAddress) || {}
  return decimals
}

/**
 * Extract the quote info
 * @param hop Hop data
 * @param pools Pools
 * @returns
 */
function getQuote(hop: Hop, pools: ExtendedPoolData[]) {
  const pool = pools.find(({ address }) => address === hop.poolAddress)
  let bidWeight = 0
  let bidReserve = ZERO
  let askWeight = 0
  let askReserve = ZERO
  if (pool) {
    const { reserve: _bidReserve, weight: _bidWeight } =
      findSideByMintAddress(hop.bidMintAddress, pool) || {}
    if (_bidReserve) bidReserve = _bidReserve
    if (_bidWeight) bidWeight = _bidWeight
    const { reserve: _askReserve, weight: _askWeight } =
      findSideByMintAddress(hop.askMintAddress, pool) || {}
    if (_askReserve) askReserve = _askReserve
    if (_askWeight) askWeight = _askWeight
  }
  return {
    bidMintAddress: hop.bidMintAddress,
    bidReserve,
    bidWeight,
    askMintAddress: hop.askMintAddress,
    askReserve,
    askWeight,
  }
}

/**
 * Compute swap price
 * @returns The swap price
 */
export function useSwapPrice() {
  const bidAmount = useSwapStore(({ bidAmount }) => bidAmount)
  const askAmount = useSwapStore(({ askAmount }) => askAmount)

  const price = useMemo(() => {
    if (!Number(bidAmount)) return 0
    return Number(askAmount) / Number(bidAmount)
  }, [bidAmount, askAmount])

  return price
}

/**
 * Compute the price impact
 * @param route The route
 * @returns The price impact
 */
export function usePriceImpact(swapPrice: number, route: Hop[]) {
  const pools = useActivePools()
  const mints = useMints()

  const originalPrice = useMemo(
    () =>
      route
        .map((hop) => getQuote(hop, pools))
        .map((quote) => ({
          ...quote,
          bidDecimals: getMintDecimals(quote.bidMintAddress, mints),
          askDecimals: getMintDecimals(quote.askMintAddress, mints),
        }))
        .map(
          ({
            bidReserve,
            bidDecimals,
            bidWeight,
            askReserve,
            askDecimals,
            askWeight,
          }) => {
            const _bidReserve = undecimalize(bidReserve, bidDecimals)
            const _askReserve = undecimalize(askReserve, askDecimals)
            if (
              !Number(_askReserve) ||
              !Number(_bidReserve) ||
              !bidWeight ||
              !askWeight
            )
              return 0
            return (
              (Number(_askReserve) * bidWeight) /
              (Number(_bidReserve) * askWeight)
            )
          },
        )
        .reduce((a, b) => a * b, 1),
    [route, pools, mints],
  )

  const priceImpact = useMemo(() => {
    if (!originalPrice || !swapPrice) return 0
    return Math.abs(originalPrice - swapPrice) / originalPrice
  }, [originalPrice, swapPrice])

  return priceImpact
}

/**
 * Compute the minimum return
 * @returns The minimum return
 */
export function useMinimumReturn() {
  const askAmount = useSwapStore(({ askAmount }) => askAmount)
  const slippage = useSwapStore(({ slippage }) => slippage)

  const minReturn = useMemo(() => {
    if (!Number(askAmount) || !slippage) return 0
    return Number(askAmount) * (1 - slippage)
  }, [askAmount, slippage])

  return minReturn
}

/**
 * Compute swap price
 * @param debounce The delay time in miliseconds. It will help to improve the performance of routing.
 * @returns The swap price
 */
export function useSenswapSwap(debounce: number = 300) {
  const [route, setRoute] = useState<SenswapBestRoute>({
    bestAmount: ZERO,
    bestRoute: [],
    bestFees: [],
  })
  const { sendTransaction } = useWallet()
  const pools = useActivePools()
  const senswap = useSenswap()
  const lamports = useLamports()
  const wrap = useWrap()
  const unwrap = useUnwrap()
  const { amount: wsol = ZERO } =
    useTokenAccountByMintAddress(WRAPPED_SOL) || {}

  // Bid
  const bidAmount = useSwapStore(({ bidAmount }) => bidAmount)
  const bidMintAddress = useSwapStore(({ bidMintAddress }) => bidMintAddress)
  const { decimals: bidDecimals = 0 } = useMintByAddress(bidMintAddress) || {}
  // Ask
  const askMintAddress = useSwapStore(({ askMintAddress }) => askMintAddress)
  const { decimals: askDecimals = 0 } = useMintByAddress(askMintAddress) || {}
  const slippage = useSwapStore(({ slippage }) => slippage)

  // Route
  const inAmount = useMemo(
    () => decimalize(bidAmount, bidDecimals),
    [bidAmount, bidDecimals],
  )
  useDebounce(
    () => {
      if (!isAddress(bidMintAddress) || !isAddress(askMintAddress)) return []
      const availableRoutes = findAvailableRoutes({
        bidMint: new web3.PublicKey(bidMintAddress),
        askMint: new web3.PublicKey(askMintAddress),
        pools: Object.values(pools),
      })
      const bestRoute = findTheBestRoute({
        inAmount,
        availableRoutes,
        pools: Object.values(pools),
      })
      return setRoute(bestRoute)
    },
    debounce,
    [bidMintAddress, askMintAddress, pools],
  )

  // Feedback
  const {
    bestAmount: outAmount,
    bestRoute,
    bestFees,
  } = useMemo(() => route, [route])
  const askAmount = useMemo(
    () => undecimalize(outAmount, askDecimals),
    [outAmount, askDecimals],
  )
  const swapPrice = useMemo(() => {
    if (!Number(bidAmount)) return 0
    return Number(askAmount) / Number(bidAmount)
  }, [bidAmount, askAmount])
  const priceImpact = usePriceImpact(swapPrice, bestRoute)
  const minimumReturn = useMemo(() => {
    if (!slippage) return ZERO
    return outAmount.mul(new BN(slippage * 100)).div(new BN(100))
  }, [slippage, outAmount])

  // Pre-instruction if any. (i.e. wrap SOL)
  const addPreTx = useCallback(
    async (tx: web3.Transaction) => {
      if (bidMintAddress !== WRAPPED_SOL) return tx
      const balance = wsol.add(new BN(lamports))
      if (inAmount.gte(balance)) throw new Error('Insufficient SOL.')
      const delta = inAmount.sub(wsol)
      const { tx: wrapTx } = await wrap(delta, false)
      return wrapTx.add(tx)
    },
    [inAmount, wsol, lamports, wrap, bidMintAddress],
  )
  // Post-instruction if any. (i.e. unwrap SOL)
  const addPostTx = useCallback(
    async (tx: web3.Transaction) => {
      if (askMintAddress !== WRAPPED_SOL) return tx
      const { tx: unwrapTx } = await unwrap(false)
      return tx.add(unwrapTx)
    },
    [askMintAddress, unwrap],
  )
  // Swap instruction
  const swap = useCallback(async () => {
    if (!sendTransaction) throw new Error('Wallet is not connected yet.')
    if (!isAddress(bidMintAddress)) throw new Error('Invalid bid mint address.')
    if (!isAddress(askMintAddress)) throw new Error('Invalid ask mint address.')
    if (inAmount.lte(ZERO)) throw new Error('Invalid bid amount.')

    let { tx } = await senswap.route({
      bidAmount: inAmount,
      routes: bestRoute.map(
        ({ poolAddress, bidMintAddress, askMintAddress }) => ({
          pool: new web3.PublicKey(poolAddress),
          bidMint: new web3.PublicKey(bidMintAddress),
          askMint: new web3.PublicKey(askMintAddress),
        }),
      ),
      limit: minimumReturn,
      sendAndConfirm: false,
    })
    tx = await addPreTx(tx)
    tx = await addPostTx(tx)
    const txId = await sendTransaction(tx, senswap.program.provider.connection)
    await confirmTransaction(txId, senswap.program.provider.connection)
    return txId
  }, [
    sendTransaction,
    bidMintAddress,
    askMintAddress,
    inAmount,
    senswap,
    bestRoute,
    minimumReturn,
    addPreTx,
    addPostTx,
  ])

  // Swap Info
  const info: GeneralSwapInfo | undefined = useMemo(() => {
    if (!Number(bidAmount) || !bestRoute.length) return undefined
    return {
      bidAmount,
      bidMintAddress,
      askAmount,
      askMintAddress,
      priceImpact,
      route: bestRoute
        .map(({ bidMintAddress }) => bidMintAddress)
        .concat([askMintAddress]),
      fees: bestFees.map(({ mint, amount }) => ({
        amount,
        mintAddress: mint.toBase58(),
      })),
      platform: 'Senswap',
      swap,
    }
  }, [
    bidAmount,
    bestRoute,
    bidMintAddress,
    askAmount,
    askMintAddress,
    priceImpact,
    bestFees,
    swap,
  ])

  return { value: info, loading: false }
}

/**
 * The general hook for swap on Jupiter Aggregator
 * @returns The GeneralSwapInfo
 */
export function useJupAgSwap(): AsyncState<GeneralSwapInfo | undefined> {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()

  // Bid
  const bidMintAddress = useSwapStore(({ bidMintAddress }) => bidMintAddress)
  const bidAmount = useSwapStore(({ bidAmount }) => bidAmount)
  const { decimals: bidDecimals = 0 } = useMintByAddress(bidMintAddress) || {}
  // Ask
  const askMintAddress = useSwapStore(({ askMintAddress }) => askMintAddress)
  const { decimals: askDecimals = 0 } = useMintByAddress(askMintAddress) || {}
  const slippage = useSwapStore(({ slippage }) => slippage)

  // Route
  const amount = useMemo(
    () => decimalize(bidAmount, bidDecimals),
    [bidAmount, bidDecimals],
  )
  const info = useAsync(async () => {
    if (!isAddress(bidMintAddress) || !isAddress(askMintAddress))
      return undefined
    if (amount.lte(ZERO)) return undefined
    if (slippage < 0 || slippage > 1) return undefined

    const { data: quote } = await axios.get<JupAgQuoteMetadata>(
      'https://quote-api.jup.ag/v6/quote',
      {
        params: {
          inputMint: bidMintAddress,
          outputMint: askMintAddress,
          amount: amount.toString(),
          slippageBps: slippage * 10000,
        },
      },
    )
    if (!quote) return undefined

    // Swap function
    const swap = async () => {
      if (!publicKey || !sendTransaction)
        throw new Error('Not connect wallet yet.')
      const { data } = await axios.post<JupAgSwapMetadata>(
        'https://quote-api.jup.ag/v6/swap',
        {
          quoteResponse: quote,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
        },
      )
      if (!data) throw new Error('Unexpected error.')
      const buf = Buffer.from(data.swapTransaction, 'base64')
      const tx = web3.VersionedTransaction.deserialize(buf)
      const txId = await sendTransaction(tx, connection)
      return txId
    }

    // Swap Info
    const result: GeneralSwapInfo = {
      bidAmount: undecimalize(new BN(quote.inAmount), bidDecimals),
      bidMintAddress: quote.inputMint,
      askAmount: undecimalize(new BN(quote.outAmount), askDecimals),
      askMintAddress: quote.outputMint,
      priceImpact: Number(quote.priceImpactPct),
      route: [bidMintAddress, askMintAddress],
      fees: quote.routePlan.map(({ swapInfo }) => ({
        amount: new BN(swapInfo.feeAmount),
        mintAddress: swapInfo.feeMint,
      })),
      platform: 'Jupiter Aggregator',
      swap,
    }
    return result
  }, [
    bidMintAddress,
    bidDecimals,
    askMintAddress,
    askDecimals,
    amount,
    slippage,
    publicKey,
    sendTransaction,
    connection,
  ])

  return info
}
