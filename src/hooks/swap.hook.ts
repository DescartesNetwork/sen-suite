import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { env } from '@/configs/env'
import { useCallback } from 'react'

export type SwapStore = {
  bidTokenAddress: string
  setBidTokenAddress: (bidTokenAddress: string) => void
  bidAmount: string
  setBidAmount: (bidAmount: string) => void
  askTokenAddress: string
  setAskTokenAddress: (askTokenAddress: string) => void
  askAmount: string
  setAskAmount: (askAmount: string) => void
}

/**
 * Store
 */

export const useSwapStore = create<SwapStore>()(
  devtools(
    (set) => ({
      bidTokenAddress: '',
      setBidTokenAddress: (bidTokenAddress: string) =>
        set({ bidTokenAddress }, false, 'setBidTokenAddress'),
      bidAmount: '',
      setBidAmount: (bidAmount: string) =>
        set({ bidAmount }, false, 'setBidAmount'),
      askTokenAddress: '',
      setAskTokenAddress: (askTokenAddress: string) =>
        set({ askTokenAddress }, false, 'setAskTokenAddress'),
      askAmount: '',
      setAskAmount: (askAmount: string) =>
        set({ askAmount }, false, 'setAskAmount'),
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
