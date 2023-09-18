'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { LaunchpadData } from '@sentre/launchpad'
import { SystemProgram } from '@solana/web3.js'
import { produce } from 'immer'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import BN from 'bn.js'

import { env } from '@/configs/env'
import { useLaunchpadProgram } from '@/hooks/launchpad.hook'
import { useBalancer } from '@/hooks/pool.hook'

export type LaunchpadStore = {
  launchpads: Record<string, LaunchpadData>
  upsertLaunchpad: (address: string, launchpad: LaunchpadData) => void
}

/**
 * Store
 */
export const useLaunchpadStore = create<LaunchpadStore>()(
  devtools(
    (set) => ({
      launchpads: {},
      upsertLaunchpad: (address: string, launchpad: LaunchpadData) =>
        set(
          produce<LaunchpadStore>(({ launchpads }) => {
            launchpads[address] = launchpad
          }),
          false,
          'upsertLaunchpad',
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

export function LaunchpadProvider({ children }: { children: ReactNode }) {
  const upsertLaunchpad = useLaunchpadStore(
    ({ upsertLaunchpad }) => upsertLaunchpad,
  )
  const launchpad = useLaunchpadProgram()
  const balancer = useBalancer()

  const fetchLaunchpads = useCallback(async () => {
    const accounts = await launchpad.program.account.launchpad.all()
    const pools = await balancer.getAllPoolData()
    for (const { account, publicKey } of accounts) {
      const poolData = pools.find((pool) => pool.publicKey.equals(account.pool))
      if (!poolData) continue
      upsertLaunchpad(publicKey.toBase58(), account as any)
    }
  }, [balancer, launchpad, upsertLaunchpad])

  useEffect(() => {
    fetchLaunchpads()
  }, [fetchLaunchpads])

  return <Fragment>{children}</Fragment>
}

/**
 * Hooks
 */

/**
 * Get all Launchpads
 * @returns launchpad list
 */
export const useLaunchpads = () => {
  const launchpads = useLaunchpadStore(({ launchpads }) => launchpads)
  return launchpads
}

/**
 * Get launchpad data by address
 * @returns  LaunchpadData
 */
export const useLaunchpadByAddress = (launchpadAddress: string) => {
  const launchpad = useLaunchpadStore(
    ({ launchpads }) => launchpads[launchpadAddress],
  ) || {
    authority: SystemProgram.programId,
    baseMint: SystemProgram.programId,
    endTime: new BN(0),
    endWeights: new BN(0),
    mint: SystemProgram.programId,
    pool: SystemProgram.programId,
    stableMint: SystemProgram.programId,
    startTime: new BN(0),
  }
  return launchpad
}
