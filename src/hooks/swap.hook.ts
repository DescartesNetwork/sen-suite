import { useCallback } from 'react'
import { useAsync } from 'react-use'
import axios from 'axios'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { env } from '@/configs/env'
import { isAddress } from '@/helpers/utils'
import { useTokenByAddress } from '@/providers/token.provider'
import { decimalize } from '@/helpers/decimals'

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

export const useSwap = () => {
  const bidTokenAddress = useSwapStore(({ bidTokenAddress }) => bidTokenAddress)
  const bidAmount = useSwapStore(({ bidAmount }) => bidAmount)
  const askTokenAddress = useSwapStore(({ askTokenAddress }) => askTokenAddress)
  const slippage = useSwapStore(({ slippage }) => slippage)

  const { decimals } = useTokenByAddress(bidTokenAddress) || { decimals: 0 }

  const { value: routes, loading } = useAsync(async () => {
    if (
      !isAddress(bidTokenAddress) ||
      !isAddress(askTokenAddress) ||
      !bidAmount
    )
      return undefined
    try {
      const amount = decimalize(bidAmount, decimals).toString()
      const {
        data: { data },
      } = await axios.get(
        `https://quote-api.jup.ag/v4/quote?inputMint=${bidTokenAddress}&outputMint=${askTokenAddress}&amount=${amount}&slippageBps=${
          slippage * 10000
        }`,
      )
      return data
    } catch (er) {
      return undefined
    }
  }, [bidTokenAddress, bidAmount, askTokenAddress, slippage, decimals])

  const swap = useCallback(async () => {
    console.log(routes)
  }, [routes])

  return { routes, swap, fetching: loading }
}
