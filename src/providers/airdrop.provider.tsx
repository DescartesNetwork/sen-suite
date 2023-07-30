'use client'
import { Fragment, ReactNode } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { env } from '@/configs/env'

export type AirdropStore = {
  mintAddress: string
  setMintAddress: (mintAddress: string) => void
  data: string[][]
  setData: (data: string[][]) => void
  decimalized: boolean
  setDecimalized: (decimalized: boolean) => void
  unmount: () => void
}

/**
 * Store
 */
export const useAirdropStore = create<AirdropStore>()(
  devtools(
    (set) => ({
      mintAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
      setMintAddress: (mintAddress) =>
        set({ mintAddress }, false, 'setMintAddress'),
      data: [],
      setData: (data) => set({ data }, false, 'setData'),
      decimalized: false,
      setDecimalized: (decimalized) =>
        set({ decimalized }, false, 'setDecimalized'),
      unmount: () => set({ mintAddress: '' }, false, 'unmount'),
    }),
    {
      name: 'airdrop',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */
export const AirdropProvider = ({ children }: { children: ReactNode }) => {
  return <Fragment>{children}</Fragment>
}

/**
 * Get/Set airdropped mint address
 * @returns Like-useState object
 */
export const useAirdropMintAddress = () => {
  const mintAddress = useAirdropStore(({ mintAddress }) => mintAddress)
  const setMintAddress = useAirdropStore(({ setMintAddress }) => setMintAddress)
  return { mintAddress, setMintAddress }
}

/**
 * Get/Set airdropped data
 * @returns Like-useState object
 */
export const useAirdropData = () => {
  const data = useAirdropStore(({ data }) => data)
  const setData = useAirdropStore(({ setData }) => setData)
  return { data, setData }
}

/**
 * Get/Set airdropped decimalized
 * @returns Like-useState object
 */
export const useAirdropDecimalized = () => {
  const decimalized = useAirdropStore(({ decimalized }) => decimalized)
  const setDecimalized = useAirdropStore(({ setDecimalized }) => setDecimalized)
  return { decimalized, setDecimalized }
}
