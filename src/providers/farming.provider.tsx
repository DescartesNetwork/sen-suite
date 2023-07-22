'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { FarmData } from '@sentre/farming'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { produce } from 'immer'

import { env } from '@/configs/env'
import { useFarming } from '@/hooks/farming.hook'
import { PublicKey } from '@solana/web3.js'

export type SortState = -1 | 0 | 1
export type FarmingStore = {
  farms: Record<string, FarmData>
  upsertFarms: (newFarms: Record<string, FarmData>) => void
  sortedByLiquidity: SortState
  setSortedByLiquidity: (value: SortState) => void
  sortedByApr: SortState
  setSortedByApr: (value: SortState) => void
  nftBoosted: boolean
  setNftBoosted: (value: boolean) => void
  unmount: () => void
}

/**
 * Store
 */
export const useFarmingStore = create<FarmingStore>()(
  devtools(
    (set) => ({
      farms: {},
      upsertFarms: (newFarms: Record<string, FarmData>) =>
        set(
          produce<FarmingStore>(({ farms }) => {
            Object.keys(newFarms).forEach((farmAddress) => {
              if (!farms[farmAddress])
                farms[farmAddress] = newFarms[farmAddress]
              else Object.assign(farms[farmAddress], newFarms[farmAddress])
            })
          }),
          false,
          'upsertFarms',
        ),
      sortedByLiquidity: 0,
      setSortedByLiquidity: (sortedByLiquidity) =>
        set({ sortedByLiquidity }, false, 'setSortedByLiquidity'),
      sortedByApr: 0,
      setSortedByApr: (sortedByApr) =>
        set({ sortedByApr }, false, 'setSortedByApr'),
      nftBoosted: false,
      setNftBoosted: (nftBoosted: boolean) =>
        set({ nftBoosted }, false, 'setNftBoosted'),
      unmount: () => set({ farms: {} }, false, 'unmount'),
    }),
    {
      name: 'farming',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */
export default function FarmingProvider({ children }: { children: ReactNode }) {
  const farming = useFarming()
  const upsertFarms = useFarmingStore(({ upsertFarms }) => upsertFarms)
  const unmount = useFarmingStore(({ unmount }) => unmount)

  const fetch = useCallback(async () => {
    const data: Array<{ publicKey: PublicKey; account: FarmData }> =
      (await farming.program.account.farm.all()) as any
    const farms: Record<string, FarmData> = {}
    data.forEach(
      ({ publicKey, account }) => (farms[publicKey.toBase58()] = account),
    )
    return upsertFarms(farms)
  }, [farming, upsertFarms])

  useEffect(() => {
    fetch()
    return unmount
  }, [fetch, unmount])

  return <Fragment>{children}</Fragment>
}

/**
 * Get all farms
 * @returns Farm list
 */
export const useAllFrams = () => {
  const farms = useFarmingStore(({ farms }) => farms)
  return farms
}

/**
 * Use sorted by liquidity
 */
export const useSortedByLiquidity = () => {
  const { sortedByLiquidity, setSortedByLiquidity } = useFarmingStore(
    ({ sortedByLiquidity, setSortedByLiquidity }) => ({
      sortedByLiquidity,
      setSortedByLiquidity,
    }),
  )
  return { sortedByLiquidity, setSortedByLiquidity }
}

/**
 * Use sorted by APR
 */
export const useSortedByApr = () => {
  const { sortedByApr, setSortedByApr } = useFarmingStore(
    ({ sortedByApr, setSortedByApr }) => ({
      sortedByApr,
      setSortedByApr,
    }),
  )
  return { sortedByApr, setSortedByApr }
}

/**
 * Use sorted by APR
 */
export const useNftBoosted = () => {
  const { nftBoosted, setNftBoosted } = useFarmingStore(
    ({ nftBoosted, setNftBoosted }) => ({
      nftBoosted,
      setNftBoosted,
    }),
  )
  return { nftBoosted, setNftBoosted }
}
