'use client'
import { Fragment, ReactNode } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useUnmount } from 'react-use'

import { env } from '@/configs/env'
import swapConfig from '@/configs/swap.config'

export type PoolStructureData = {
  mintAddress: string
  weight: number
}

export const DUMMY_STRUCTURE: PoolStructureData[] = [
  {
    mintAddress: swapConfig.usdcAddress,
    weight: 50,
  },
  {
    mintAddress: swapConfig.usdtAddress,
    weight: 50,
  },
]

export type NewPoolStore = {
  structure: PoolStructureData[]
  setStructure: (structure: PoolStructureData[]) => void
  unmount: () => void
}

/**
 * Store
 */

export const useNewPoolStore = create<NewPoolStore>()(
  devtools(
    (set) => ({
      structure: DUMMY_STRUCTURE,
      setStructure: (structure: PoolStructureData[]) =>
        set({ structure }, false, 'setStructure'),
      unmount: () => set({ structure: DUMMY_STRUCTURE }, false, 'unmount'),
    }),
    {
      name: 'new-pool',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */
export default function NewPoolProvider({ children }: { children: ReactNode }) {
  const unmount = useNewPoolStore(({ unmount }) => unmount)

  useUnmount(unmount)

  return <Fragment>{children}</Fragment>
}
