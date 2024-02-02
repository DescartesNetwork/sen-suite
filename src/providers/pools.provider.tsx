'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { produce } from 'immer'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type PoolData, PoolStates } from '@sentre/senswap'
import isEqual from 'react-fast-compare'
import { web3 } from '@coral-xyz/anchor'

import { env } from '@/configs/env'
import { useSenswap } from '@/hooks/pool.hook'
import { ZERO } from '@/helpers/decimals'

export type ExtendedPoolData = { address: string } & PoolData

const DUMMY_POOL: Partial<ExtendedPoolData> = {
  address: web3.SystemProgram.programId.toBase58(),
  authority: web3.SystemProgram.programId,
  mintLpt: web3.SystemProgram.programId,
  reserves: [ZERO],
  mints: [web3.SystemProgram.programId],
  weights: [ZERO],
  treasuries: [web3.SystemProgram.programId],
  fee: ZERO,
  tax: ZERO,
  state: PoolStates.Uninitialized,
}

export type PoolStore = {
  pools: Record<string, ExtendedPoolData>
  upsertPool: (payload: Record<string, ExtendedPoolData>) => void
}

/**
 * Store
 */
export const usePoolStore = create<PoolStore>()(
  devtools(
    (set) => ({
      pools: {},
      upsertPool: (payload: Record<string, ExtendedPoolData>) =>
        set(
          produce<PoolStore>(({ pools }) => {
            Object.assign(pools, payload)
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
export default function PoolProvider({ children }: { children: ReactNode }) {
  const senswap = useSenswap()
  const upsertPool = usePoolStore(({ upsertPool }) => upsertPool)

  const fetch = useCallback(async () => {
    const pools = await senswap.getAllPoolData()
    const payload: Record<string, ExtendedPoolData> = {}
    pools.forEach(({ account, publicKey }) => {
      if (!isEqual(account.state, PoolStates.Deleted))
        payload[publicKey.toBase58()] = {
          address: publicKey.toBase58(),
          ...account,
        }
    })
    return upsertPool(payload)
  }, [senswap, upsertPool])

  const watch = useCallback(() => {
    const { connection } = senswap.program.provider
    const id = connection.onProgramAccountChange(
      senswap.program.account.pool.programId,
      ({
        accountId,
        accountInfo: { data },
      }: {
        accountId: web3.PublicKey
        accountInfo: { data: Buffer }
      }) => {
        const accountData: PoolData = senswap.program.coder.accounts.decode(
          'pool',
          data,
        )
        return upsertPool({
          [accountId.toBase58()]: {
            address: accountId.toBase58(),
            ...accountData,
          },
        })
      },
      'confirmed',
    )
    return () => {
      connection.removeProgramAccountChangeListener(id)
    }
  }, [senswap, upsertPool])

  useEffect(() => {
    fetch()
    return watch()
  }, [fetch, watch])

  return <Fragment>{children}</Fragment>
}

/**
 * Hooks
 */

/**
 * Get all pools
 * @returns Pool list
 */
export const usePools = () => {
  const pools = usePoolStore(({ pools }) => pools)
  return pools
}

/**
 * Get all active pools
 * @returns Active pool list
 */
export const useActivePools = () => {
  const pools = usePoolStore(({ pools }) =>
    Object.values(pools).filter(
      ({ state }) =>
        isEqual(state, PoolStates.Initialized) ||
        isEqual(state, PoolStates.Initializing),
    ),
  )
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
