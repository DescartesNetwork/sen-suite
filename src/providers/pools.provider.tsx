'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { produce } from 'immer'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { BN } from 'bn.js'
import { SystemProgram } from '@solana/web3.js'
import { PoolData, PoolStates } from '@sentre/senswap'
import isEqual from 'react-fast-compare'

import { env } from '@/configs/env'
import { useSenswap } from '@/hooks/pool.hook'
import axios from 'axios'
import solConfig from '@/configs/sol.config'

const DUMMY_POOL = {
  authority: SystemProgram.programId,
  mintLpt: SystemProgram.programId,
  reserves: [new BN(0)],
  mints: [SystemProgram.programId],
  weights: [new BN(0)],
  treasuries: [new BN(0)],
  fee: new BN(0),
  tax: new BN(0),
}

type VolumeData = {
  volumes: Record<string, number>
  totalVol: number
}

export type PoolStore = {
  loading: boolean
  volumes: Record<string, VolumeData>
  pools: Record<string, PoolData>
  poolsTvl: Record<string, number>
  totalTvl: number
  setTotalTvl: (tvl: number) => void
  setLoading: (loading: boolean) => void
  upsertPool: (pool: string, newPool: PoolData) => void
  upsertPoolTvl: (newPoolsTvl: Record<string, number>) => void
  upsertVolumes: (volumes: Record<string, VolumeData>) => void
}

/**
 * Store
 */
export const usePoolStore = create<PoolStore>()(
  devtools(
    (set) => ({
      pools: {},
      poolsTvl: {},
      volumes: {},
      totalTvl: 0,
      loading: true,
      upsertPool: (address: string, poolData: PoolData) =>
        set(
          produce<PoolStore>(({ pools }) => {
            pools[address] = poolData
          }),
          false,
          'upsertPool',
        ),
      upsertPoolTvl: (poolsTvl) => set({ poolsTvl }, false, 'upsertPoolTvl'),
      upsertVolumes: (volumes) => set({ volumes }, false, 'upsertVolumes'),
      setTotalTvl: (totalTvl) => set({ totalTvl }, false, 'setTotalTvl'),
      setLoading: (loading) => set({ loading }, false, 'setLoading'),
    }),
    {
      name: 'pools',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */
export function PoolProvider({ children }: { children: ReactNode }) {
  const senswap = useSenswap()
  const upsertPool = usePoolStore(({ upsertPool }) => upsertPool)
  const upsertPoolTvl = usePoolStore(({ upsertPoolTvl }) => upsertPoolTvl)
  const setTotalTvl = usePoolStore(({ setTotalTvl }) => setTotalTvl)
  const upsertVolumes = usePoolStore(({ upsertVolumes }) => upsertVolumes)
  const setLoading = usePoolStore(({ setLoading }) => setLoading)

  const fetchPools = useCallback(async () => {
    const pools = await senswap.getAllPoolData()
    for (const { account, publicKey } of pools) {
      const poolState = account.state
      if (isEqual(poolState, PoolStates.Deleted)) continue
      upsertPool(publicKey.toBase58(), account)
    }
  }, [senswap, upsertPool])

  const watchPools = useCallback(() => {
    const { connection } = senswap.program.provider
    const id = connection.onProgramAccountChange(
      senswap.program.account.pool.programId,
      ({ accountId, accountInfo: { data } }) => {
        const accountData = senswap.program.coder.accounts.decode('pool', data)
        return upsertPool(accountId.toBase58(), accountData)
      },
      'confirmed',
    )
    return () => {
      connection.removeProgramAccountChangeListener(id)
    }
  }, [senswap, upsertPool])

  const fetchPoolsTvl = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch all pool tvl
      const { data: poolsTvl } = await axios.get(
        solConfig.statRpc + `stat/balansol/all-tvl`,
      )
      upsertPoolTvl(poolsTvl)

      // Fetch total balansol tvl
      const { data } = await axios.get(
        solConfig.statRpc + `stat/total-tvl/${solConfig.senswapAddress}`,
      )
      setTotalTvl(data.totalTvl)

      // Fetch all pool vol24h
      const { data: volumes } = await axios.get(
        solConfig.statRpc + `stat/balansol/all-volume`,
      )
      upsertVolumes(volumes)
    } catch (error) {
      console.log('Fetching stat error: ', error)
    } finally {
      setLoading(false)
    }
  }, [setLoading, setTotalTvl, upsertPoolTvl, upsertVolumes])

  useEffect(() => {
    fetchPools()
    const unwatch = watchPools()
    return unwatch
  }, [fetchPools, watchPools])

  useEffect(() => {
    fetchPoolsTvl()
  }, [fetchPoolsTvl])

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
 * Get all Pools tvl
 * @returns Pool tvl list
 */
export const usePoolsTvl = () => {
  const poolsTvl = usePoolStore(({ poolsTvl }) => poolsTvl)
  return poolsTvl
}

/**
 * Get Pools tvl
 * @returns Pool tvl
 */
export const usePoolTvl = (poolAddress: string) => {
  const tvl = usePoolStore(({ poolsTvl }) => poolsTvl[poolAddress]) || 0
  return tvl
}

/**
 * Get loading pool stat
 * @returns true/false
 */
export const usePoolStatLoading = () => {
  const loading = usePoolStore(({ loading }) => loading)
  return loading
}

/**
 * Get Pools tvl
 * @returns Pool tvl
 */
export const usePoolVolumesIn7Days = (poolAddress: string) => {
  const vols = usePoolStore(({ volumes }) => volumes[poolAddress]) || {
    volumes: {},
    totalVol: 0,
  }
  return vols
}

/**
 * Get total tvl
 * @returns total tvl
 */
export const useTotalPoolTvl = () => {
  const totalTvl = usePoolStore(({ totalTvl }) => totalTvl)
  return totalTvl
}

/**
 * Get pool data by pool address
 * @returns PoolData
 */
export const usePoolByAddress = (poolAddress: string) => {
  const pool = usePoolStore(({ pools }) => pools[poolAddress]) || DUMMY_POOL
  return pool
}
