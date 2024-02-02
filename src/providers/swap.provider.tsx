'use client'
import { Fragment, ReactNode } from 'react'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useUnmount } from 'react-use'

import { env } from '@/configs/env'
import swapConfig from '@/configs/swap.config'

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
  overBudget: boolean
  setOverBudget: (slippage: boolean) => void
  unmount: () => void
}

/**
 * Store
 */

export const useSwapStore = create<SwapStore>()(
  devtools(
    persist(
      (set) => ({
        bidMintAddress: swapConfig.usdcAddress,
        setBidMintAddress: (bidMintAddress: string) =>
          set({ bidMintAddress }, false, 'setBidMintAddress'),
        bidAmount: '',
        setBidAmount: (bidAmount: string) =>
          set({ bidAmount }, false, 'setBidAmount'),
        askMintAddress: swapConfig.sntrAddress,
        setAskMintAddress: (askMintAddress: string) =>
          set({ askMintAddress }, false, 'setAskMintAddress'),
        askAmount: '',
        setAskAmount: (askAmount: string) =>
          set({ askAmount }, false, 'setAskAmount'),
        slippage: 0.01,
        setSlippage: (slippage: number) =>
          set({ slippage }, false, 'setSlippage'),
        overBudget: false,
        setOverBudget: (overBudget) =>
          set({ overBudget }, false, 'setOverBudget'),
        unmount: () => set({ bidAmount: '', askAmount: '' }, false, 'unmount'),
      }),
      {
        name: 'swap-storage',
        partialize: (state) =>
          Object.fromEntries(
            Object.entries(state).filter(([key]) => key === 'slippage'),
          ),
      },
    ),
    {
      name: 'swap',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */
export default function SwapProvider({ children }: { children: ReactNode }) {
  const unmount = useSwapStore(({ unmount }) => unmount)

  useUnmount(unmount)

  return <Fragment>{children}</Fragment>
}
