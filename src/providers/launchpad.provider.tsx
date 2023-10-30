'use client'
import { Fragment, ReactNode, useCallback, useEffect, useMemo } from 'react'
import { ChequeData, LaunchpadData } from '@sentre/launchpad'
import { PublicKey, SystemProgram } from '@solana/web3.js'
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
  cheques: Record<string, ChequeData>
  upsertCheque: (address: string, cheque: ChequeData) => void
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
      cheques: {},
      upsertCheque: (address: string, cheque: ChequeData) =>
        set(
          produce<LaunchpadStore>(({ cheques }) => {
            cheques[address] = cheque
          }),
          false,
          'upsertCheque',
        ),
    }),
    {
      name: 'launchpad',
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
  const upsertCheque = useLaunchpadStore(({ upsertCheque }) => upsertCheque)
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

  const fetchCheques = useCallback(async () => {
    const accounts = await launchpad.program.account.cheque.all()
    for (const { account, publicKey } of accounts)
      upsertCheque(publicKey.toBase58(), account as any)
  }, [launchpad.program.account.cheque, upsertCheque])

  useEffect(() => {
    fetchCheques()
  }, [fetchCheques])

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
    startReserves: [new BN(0), new BN(0)],
  }
  return launchpad
}

/**
 * Get all cheques
 * @returns cheque list
 */
export const useCheques = () => {
  const cheques = useLaunchpadStore(({ cheques }) => cheques)
  return cheques
}

/**
 * Filter cheques
 * @returns cheque address list
 */
export const useFilterCheques = (
  launchpadAddress: string,
  owner?: PublicKey | null | undefined,
) => {
  const cheques = useLaunchpadStore(({ cheques }) => cheques)

  const filteredCheques = useMemo(
    () =>
      Object.keys(cheques).filter((address) => {
        const { authority, launchpad } = cheques[address]
        if (!owner) return launchpad.toBase58() === launchpadAddress
        return (
          authority.equals(owner) && launchpad.toBase58() === launchpadAddress
        )
      }),
    [cheques, launchpadAddress, owner],
  )
  return filteredCheques
}

/**
 * Calculate metric in cheques list
 * @returns {totalAsk, totalBid, totalUsers}
 */
export const useCalculateMetric = (chequeAddresses: string[]) => {
  const cheques = useCheques()

  const { totalAsk, totalBid, totalUsers } = useMemo(() => {
    let totalBid = new BN(0)
    let totalAsk = new BN(0)
    const boughtAddress: string[] = []
    for (const address of chequeAddresses) {
      const { authority, bidAmount, askAmount } = cheques[address]
      totalBid = totalBid.add(bidAmount)
      totalAsk = totalAsk.add(askAmount)
      if (boughtAddress.includes(authority.toBase58())) continue
      boughtAddress.push(authority.toBase58())
    }
    return {
      totalUsers: boughtAddress.length,
      totalBid,
      totalAsk,
    }
  }, [cheques, chequeAddresses])

  return { totalAsk, totalBid, totalUsers }
}

/**
 * Get cheque data by address
 * @returns cheque data
 */
export const useChequeByAddress = (chequeAddress: string) => {
  const cheque = useLaunchpadStore(({ cheques }) => cheques[chequeAddress]) || {
    askAmount: new BN(0),
    authority: SystemProgram.programId,
    bidAmount: new BN(0),
    createAt: new BN(0),
    launchpad: SystemProgram.programId,
    state: { uninitialized: {} },
  }
  return cheque
}
