import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { env } from '@/configs/env'

export type SwapStore = {
  bidTokenAddress: string
  setBidTokenAddress: (bidTokenAddress: string) => void
  bidAmount: string
  setBidAmount: (bidAmount: string) => void
}

export const useSwapStore = create<SwapStore>()(
  devtools(
    (set) => ({
      bidTokenAddress: '',
      setBidTokenAddress: (bidTokenAddress: string) =>
        set({ bidTokenAddress }, false, 'setBidTokenAddress'),
      bidAmount: '',
      setBidAmount: (bidAmount: string) =>
        set({ bidAmount }, false, 'setBidAmount'),
    }),
    {
      name: 'swap',
      enabled: env === 'development',
    },
  ),
)
