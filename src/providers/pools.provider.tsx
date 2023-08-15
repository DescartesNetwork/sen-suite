'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { useDebounce } from 'react-use'
import { PoolData, PoolState } from '@senswap/balancer'
import { produce } from 'immer'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { BN } from 'bn.js'
import { SystemProgram } from '@solana/web3.js'

import { useBalancer } from '@/hooks/pool.hook'
import { TotalSummary } from '@/app/pools/stat/constants/summary'
import { useParams } from 'next/navigation'
import { isAddress } from '@sentre/utility'
import { DateHelper } from '@/app/pools/stat/helpers/date'
import { env } from '@/configs/env'
import PoolService from '@/app/pools/stat/logic/pool/pool'

export type PoolStore = {
  pools: Record<string, PoolData>
  upsertPool: (address: string, newPool: PoolData) => void
}

type SummaryStore = { [day: string]: TotalSummary }
type StoreData = { [poolAddr: string]: SummaryStore }
export type StatStore = {
  loading: boolean
  setLoading: (loading: boolean) => void
  data: StoreData
  upsert: (poolAddr: string, poolSummary: SummaryStore) => void
}

/**
 * Store
 */
export const usePoolStore = create<PoolStore>()(
  devtools(
    (set) => ({
      pools: {},
      upsertPool: (address: string, poolData: PoolData) =>
        set(
          produce<PoolStore>(({ pools }) => {
            pools[address] = poolData
          }),
          false,
          'upsertPool',
        ),
    }),
    {
      name: 'pools',
      enabled: env === 'development',
    },
  ),
)
export const useStatStore = create<StatStore>()(
  devtools(
    persist(
      (set) => ({
        loading: false,
        setLoading: (loading) => set({ loading }),
        data: {},
        upsert: (poolAddr: string, poolSummary: SummaryStore) =>
          set(
            produce<StatStore>(({ data }) => {
              if (!data[poolAddr]) data[poolAddr] = {}
              Object.assign(data[poolAddr], poolSummary)
            }),
          ),
      }),
      { name: 'stat', storage: createJSONStorage(() => localStorage) },
    ),
    {
      name: 'stat',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */
export function PoolProvider({ children }: { children: ReactNode }) {
  const balancer = useBalancer()
  const upsertPool = usePoolStore(({ upsertPool }) => upsertPool)

  const fetchPools = useCallback(async () => {
    const pools = await balancer.getAllPoolData()
    for (const pool of pools) {
      const poolData = pool.account as PoolData
      const poolState = poolData.state as PoolState
      if (poolState['deleted']) continue
      upsertPool(pool.publicKey.toBase58(), poolData)
    }
  }, [balancer, upsertPool])

  useEffect(() => {
    fetchPools()
  }, [fetchPools])

  return <Fragment>{children}</Fragment>
}

export function StatProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const poolAddress = params.poolAddress as string
  const balancer = useBalancer()
  const upsert = useStatStore(({ upsert }) => upsert)
  const setLoading = useStatStore(({ setLoading }) => setLoading)

  const syncDailyReport = useCallback(async () => {
    if (!isAddress(poolAddress)) return
    const DATE_RANGE = 7
    try {
      setLoading(true)
      const timeTo = new DateHelper()
      const timeFrom = new DateHelper().subtractDay(DATE_RANGE)
      const poolStatService = new PoolService(poolAddress, balancer)
      const dailyInfo = await poolStatService.getDailyInfo(timeFrom, timeTo)
      upsert(poolAddress, dailyInfo)
    } catch (error) {
      console.log('error', error)
    } finally {
      setLoading(false)
    }
  }, [balancer, poolAddress, setLoading, upsert])

  useDebounce(syncDailyReport, 300, [syncDailyReport])
  return <Fragment>{children}</Fragment>
}

/**
 * Hooks
 */

/**
 * Get all Pools
 * @returns Pool list
 */
export const usePools = () => {
  const pools = usePoolStore(({ pools }) => pools)
  return pools
}

/**
 * Get pool data by pool address
 * @returns PoolData
 */
export const usePoolByAddress = (poolAddress: string) => {
  const pool = usePoolStore(({ pools }) => pools[poolAddress]) || {
    authority: SystemProgram.programId,
    mintLpt: SystemProgram.programId,
    reserves: [new BN(0)],
    mints: [SystemProgram.programId],
    weights: [new BN(0)],
    treasuries: [new BN(0)],
  }
  return pool
}

/**
 * Get daily data by pool address
 * @returns daily data
 */
export const useStatByPoolAddress = (poolAddress: string) => {
  const dailyInfo = useStatStore(({ data }) => data[poolAddress])
  return dailyInfo
}

/**
 *  Check is fetching stat data
 * @returns isLoadingStat
 */
export const useStatLoading = () => {
  const loading = useStatStore(({ loading }) => loading)
  return loading
}
