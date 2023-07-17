import { useCallback, useEffect } from 'react'
import { useAsync } from 'react-use'
import axios from 'axios'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { VersionedTransaction } from '@solana/web3.js'
import { BN } from 'bn.js'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { env } from '@/configs/env'
import { isAddress } from '@/helpers/utils'
import { useTokenByAddress } from '@/providers/token.provider'
import { decimalize, undecimalize } from '@/helpers/decimals'

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
  data: Array<{
    amount: string
    inAmount: string
    marketInfos: Array<{
      id: string
      inAmount: string
      inputMint: string
      label: string
      lpFee: JupiterFee
      notEnoughLiquidity: boolean
      outAmount: string
      outputMint: string
      platformFee: JupiterFee
    }>
    otherAmountThreshold: string
    outAmount: string
    priceImpactPct: number
    slippageBps: number
    swapMode: JupiterSwapMode
  }>
  timeTaken: number
}

export type SwapStore = {
  bidTokenAddress: string
  setBidTokenAddress: (bidTokenAddress: string) => void
  bidAmount: string
  setBidAmount: (bidAmount: string) => void
  askTokenAddress: string
  setAskTokenAddress: (askTokenAddress: string) => void
  askAmount: string
  setAskAmount: (askAmount: string) => void
  slippage: number
  setSlippage: (slippage: number) => void
  routes: JupiterRouteInfo['data'] | undefined
  setRoutes: (routes: JupiterRouteInfo['data'] | undefined) => void
}

/**
 * Store
 */

export const useSwapStore = create<SwapStore>()(
  devtools(
    (set) => ({
      bidTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      setBidTokenAddress: (bidTokenAddress: string) =>
        set({ bidTokenAddress }, false, 'setBidTokenAddress'),
      bidAmount: '',
      setBidAmount: (bidAmount: string) =>
        set({ bidAmount }, false, 'setBidAmount'),
      askTokenAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
      setAskTokenAddress: (askTokenAddress: string) =>
        set({ askTokenAddress }, false, 'setAskTokenAddress'),
      askAmount: '',
      setAskAmount: (askAmount: string) =>
        set({ askAmount }, false, 'setAskAmount'),
      slippage: 0.01,
      setSlippage: (slippage: number) =>
        set({ slippage }, false, 'setSlippage'),
      routes: undefined,
      setRoutes: (routes: JupiterRouteInfo['data'] | undefined) =>
        set({ routes }, false, 'setRoutes'),
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
  const bidTokenAddress = useSwapStore(({ bidTokenAddress }) => bidTokenAddress)
  const setBidTokenAddress = useSwapStore(
    ({ setBidTokenAddress }) => setBidTokenAddress,
  )
  const setBidAmount = useSwapStore(({ setBidAmount }) => setBidAmount)
  const askTokenAddress = useSwapStore(({ askTokenAddress }) => askTokenAddress)
  const setAskTokenAddress = useSwapStore(
    ({ setAskTokenAddress }) => setAskTokenAddress,
  )
  const setAskAmount = useSwapStore(({ setAskAmount }) => setAskAmount)

  const onSwitch = useCallback(() => {
    setBidTokenAddress(askTokenAddress)
    setAskTokenAddress(bidTokenAddress)
    setBidAmount('')
    setAskAmount('')
  }, [
    bidTokenAddress,
    setBidTokenAddress,
    setBidAmount,
    askTokenAddress,
    setAskTokenAddress,
    setAskAmount,
  ])

  return onSwitch
}

export const useUnsafeSwap = () => {
  const bidTokenAddress = useSwapStore(({ bidTokenAddress }) => bidTokenAddress)
  const bidAmount = useSwapStore(({ bidAmount }) => bidAmount)
  const askTokenAddress = useSwapStore(({ askTokenAddress }) => askTokenAddress)
  const setAskAmount = useSwapStore(({ setAskAmount }) => setAskAmount)
  const slippage = useSwapStore(({ slippage }) => slippage)
  const setRoutes = useSwapStore(({ setRoutes }) => setRoutes)

  const { decimals: bidDecimals } = useTokenByAddress(bidTokenAddress) || {
    decimals: 0,
  }
  const { decimals: askDecimals } = useTokenByAddress(askTokenAddress) || {
    decimals: 0,
  }

  const { value, loading } = useAsync(async () => {
    if (
      !isAddress(bidTokenAddress) ||
      !isAddress(askTokenAddress) ||
      !bidAmount
    )
      return undefined
    const amount = decimalize(bidAmount, bidDecimals).toString()
    const {
      data: { data },
    } = await axios.get<JupiterRouteInfo>(
      `https://quote-api.jup.ag/v4/quote?inputMint=${bidTokenAddress}&outputMint=${askTokenAddress}&amount=${amount}&slippageBps=${
        slippage * 10000
      }`,
    )
    return data
  }, [bidTokenAddress, bidAmount, askTokenAddress, slippage, bidDecimals])

  useEffect(() => {
    const [bestRoute] = value || []
    const { outAmount } = bestRoute || {}
    if (!outAmount) setAskAmount('')
    else setAskAmount(undecimalize(new BN(outAmount), askDecimals))
    setRoutes(value)
  }, [value, setRoutes, setAskAmount, askDecimals])

  return { routes: value || [], fetching: loading }
}

export const useSwap = () => {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const routes = useSwapStore(({ routes }) => routes)

  const swap = useCallback(async () => {
    if (!publicKey || !signTransaction || !connection)
      throw new Error('Cannot connect wallet.')
    if (!routes) throw new Error('Invalid input.')
    const [bestRoute] = routes
    const {
      data: { swapTransaction },
    } = await axios.post('https://quote-api.jup.ag/v4/swap', {
      route: bestRoute,
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
  }, [routes, publicKey, signTransaction, connection])

  return { routes: routes || [], swap }
}
