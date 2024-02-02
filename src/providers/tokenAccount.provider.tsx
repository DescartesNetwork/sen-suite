'use client'
import { Fragment, ReactNode, useCallback, useEffect, useMemo } from 'react'
import { splTokenProgram } from '@coral-xyz/spl-token'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useWallet } from '@solana/wallet-adapter-react'
import { produce } from 'immer'
import { isAddress } from '@sentre/senswap'
import { web3 } from '@coral-xyz/anchor'
import BN from 'bn.js'

import { env } from '@/configs/env'
import { useSpl } from '@/hooks/spl.hook'
import { useLamports } from './wallet.provider'
import { WRAPPED_SOL } from '@/hooks/wsol.hook'
import { ZERO } from '@/helpers/decimals'

export type TokenAccount = Awaited<
  ReturnType<ReturnType<typeof splTokenProgram>['account']['account']['fetch']>
>

/**
 * Store
 */

export type TokenAccountStore = {
  tokenAccounts: Record<string, TokenAccount>
  upsertTokenAccount: (payload: Record<string, TokenAccount>) => void
}

export const useTokenAccountStore = create<TokenAccountStore>()(
  devtools(
    (set) => ({
      tokenAccounts: {},
      upsertTokenAccount: (payload: Record<string, TokenAccount>) =>
        set(
          produce<TokenAccountStore>(({ tokenAccounts }) => {
            Object.assign(tokenAccounts, payload)
          }),
          false,
          'upsertTokenAccount',
        ),
    }),
    {
      name: 'token-account',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */

export default function TokenAccountProvider({
  children,
}: {
  children: ReactNode
}) {
  const upsertTokenAccount = useTokenAccountStore(
    ({ upsertTokenAccount }) => upsertTokenAccount,
  )
  const spl = useSpl()
  const { publicKey } = useWallet()

  const fetch = useCallback(async () => {
    if (!publicKey) return []
    const data = await spl.account.account.all([
      {
        memcmp: { offset: 32, bytes: publicKey.toBase58() },
      },
    ])
    const tokenAccounts: Record<string, TokenAccount> = Object.fromEntries(
      data.map(({ publicKey, account }) => [publicKey.toBase58(), account]),
    )
    return upsertTokenAccount(tokenAccounts)
  }, [publicKey, spl, upsertTokenAccount])

  const watch = useCallback(() => {
    if (!publicKey) return () => {}
    const id = spl.provider.connection.onProgramAccountChange(
      spl.programId,
      ({ accountId, accountInfo }: web3.KeyedAccountInfo) => {
        const data = spl.coder.accounts.decode('account', accountInfo.data)
        return upsertTokenAccount({ [accountId.toBase58()]: data })
      },
      'confirmed',
      [{ memcmp: { bytes: publicKey.toBase58(), offset: 32 } }],
    )
    return () => spl.provider.connection.removeProgramAccountChangeListener(id)
  }, [publicKey, spl, upsertTokenAccount])

  useEffect(() => {
    fetch()
    return watch()
  }, [fetch, watch])

  return <Fragment>{children}</Fragment>
}

/**
 * Get all my token accounts
 * @returns Token account list
 */
export function useTokenAccounts() {
  const tokenAccounts = useTokenAccountStore(
    ({ tokenAccounts }) => tokenAccounts,
  )
  return tokenAccounts
}

/**
 * Get all my token account by mint address
 * @param mintAddress Mint address
 * @returns Token account
 */
export function useTokenAccountByMintAddress(mintAddress: string) {
  const tokenAccount = useTokenAccountStore(({ tokenAccounts }) => {
    const tokenAccountAddress = Object.keys(tokenAccounts).find(
      (tokenAccountAddress) => {
        const { mint } = tokenAccounts[tokenAccountAddress]
        return mint.toBase58() === mintAddress
      },
    )
    if (!isAddress(tokenAccountAddress)) return undefined
    return tokenAccounts[tokenAccountAddress]
  })
  return tokenAccount
}

/**
 * Token Account Amount
 * @param mintAddress Mint address
 * @returns Token account amount
 */
export function useTokenAccountAmount(mintAddress: string) {
  const lamports = useLamports()
  const { amount = ZERO } = useTokenAccountByMintAddress(mintAddress) || {}
  const result = useMemo(() => {
    if (mintAddress !== WRAPPED_SOL) return amount
    return amount.add(new BN(lamports))
  }, [lamports, amount, mintAddress])
  return result
}
