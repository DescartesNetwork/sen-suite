'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { PoolData, PoolState } from '@senswap/balancer'
import { produce } from 'immer'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { BN } from 'bn.js'
import { SystemProgram } from '@solana/web3.js'
import { useBalancer } from '@/hooks/pool.hook'

import { env } from '@/configs/env'

export type PoolStore = {
  pools: Record<string, PoolData>
  upsertPool: (address: string, newPool: PoolData) => void
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
    fee: new BN(0),
    taxFee: new BN(0),
  }
  return pool
}