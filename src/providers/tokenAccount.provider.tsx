'use client'
import { Fragment, ReactNode } from 'react'
import { splTokenProgram } from '@coral-xyz/spl-token'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAsync } from 'react-use'

import { env } from '@/configs/env'
import { isAddress } from '@/helpers/utils'
import { useSpl } from '@/hooks/spl.hook'

export type TokenAccount = Awaited<
  ReturnType<ReturnType<typeof splTokenProgram>['account']['account']['fetch']>
>

/**
 * Store
 */

export type TokenAccountStore = {
  tokenAccounts: Record<string, TokenAccount>
  setTokenAccounts: (tokenAccounts: Record<string, TokenAccount>) => void
}

export const useTokenAccountStore = create<TokenAccountStore>()(
  devtools(
    (set) => ({
      tokenAccounts: {},
      setTokenAccounts: (tokenAccounts: Record<string, TokenAccount>) =>
        set({ tokenAccounts }, false, 'setTokenAccounts'),
    }),
    {
      name: 'toke-account',
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
  const setTokenAccounts = useTokenAccountStore(
    ({ setTokenAccounts }) => setTokenAccounts,
  )
  const spl = useSpl()
  const { publicKey } = useWallet()

  useAsync(async () => {
    if (!publicKey) return []
    const data = await spl.account.account.all([
      {
        memcmp: { offset: 32, bytes: publicKey.toBase58() },
      },
    ])
    const tokenAccounts: Record<string, TokenAccount> = {}
    data.forEach(
      ({ publicKey, account }) =>
        (tokenAccounts[publicKey.toBase58()] = account),
    )
    return setTokenAccounts(tokenAccounts)
  }, [publicKey, spl, setTokenAccounts])

  return <Fragment>{children}</Fragment>
}

/**
 * Get all my token accounts
 * @returns Token account list
 */
export const useAllTokenAccounts = () => {
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
export const useTokenAccountByMintAddress = (mintAddress: string) => {
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
