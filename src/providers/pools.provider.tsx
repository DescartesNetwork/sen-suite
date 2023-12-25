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
  const senswap = useSenswap()
  const upsertPool = usePoolStore(({ upsertPool }) => upsertPool)

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

  useEffect(() => {
    fetchPools()
    const unwatch = watchPools()
    return unwatch
  }, [fetchPools, watchPools])

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
  const pool = usePoolStore(({ pools }) => pools[poolAddress]) || DUMMY_POOL
  return pool
}
