'use client'
import { Fragment, ReactNode, useCallback, useEffect, useMemo } from 'react'
import {
  PhantomWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AnchorProvider, utils } from '@coral-xyz/anchor'
import { splTokenProgram } from '@coral-xyz/spl-token'
import {
  AnchorWallet,
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react'
import { useAsync } from 'react-use'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import isEqual from 'react-fast-compare'
import { BN } from 'bn.js'

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

import { env } from '@/configs/env'
import solConfig from '@/configs/sol.config'
import { useTokenByAddress } from '@/providers/token.provider'
import { undecimalize } from '@/helpers/decimals'

export type TokenAccount = Awaited<
  ReturnType<ReturnType<typeof splTokenProgram>['account']['account']['fetch']>
>
const SUPPORTED_WALLETS = [new PhantomWalletAdapter(), new TorusWalletAdapter()]

/**
 * Store
 */

export type WalletStore = {
  tokenAccounts: Record<string, TokenAccount>
  setTokenAccounts: (tokenAccounts: Record<string, TokenAccount>) => void
  lamports: number
  setLamports: (lamports: number) => void
}

export const useWalletStore = create<WalletStore>()(
  devtools(
    (set) => ({
      tokenAccounts: {},
      setTokenAccounts: (tokenAccounts: Record<string, TokenAccount>) =>
        set({ tokenAccounts }, false, 'setTokenAccounts'),
      lamports: 0,
      setLamports: (lamports: number) =>
        set({ lamports }, false, 'setLamports'),
    }),
    {
      name: 'wallet',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */

function LamportsProvider({ children }: { children: ReactNode }) {
  const setLamports = useWalletStore(({ setLamports }) => setLamports)
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  useEffect(() => {
    if (!publicKey) return () => {}
    ;(async () => {
      const lamports = await connection.getBalance(publicKey)
      return setLamports(lamports)
    })()
    const watchId = connection.onAccountChange(publicKey, ({ lamports }) =>
      setLamports(lamports),
    )
    return () => connection.removeAccountChangeListener(watchId)
  }, [publicKey, setLamports])

  return <Fragment>{children}</Fragment>
}

function TokenAccountProvider({ children }: { children: ReactNode }) {
  const setTokenAccounts = useWalletStore(
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

export default function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <ConnectionProvider endpoint={solConfig.rpc}>
      <SolanaWalletProvider wallets={SUPPORTED_WALLETS} autoConnect>
        <WalletModalProvider>
          <LamportsProvider>
            <TokenAccountProvider>{children}</TokenAccountProvider>
          </LamportsProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}

/**
 * Hooks
 */

export const useAnchorProvider = () => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  const provider = useMemo(() => {
    const _wallet: AnchorWallet = wallet || {
      publicKey: SystemProgram.programId,
      signTransaction: async (tx) => tx,
      signAllTransactions: async (txs) => txs,
    }
    return new AnchorProvider(connection, _wallet, { commitment: 'confirmed' })
  }, [connection, wallet])
  return provider
}

export const useSpl = () => {
  const provider = useAnchorProvider()
  const spl = useMemo(() => splTokenProgram({ provider }), [provider])
  return spl
}

export const useMyTokenAccounts = () => {
  const tokenAccounts = useWalletStore(({ tokenAccounts }) => tokenAccounts)
  return tokenAccounts
}

export const useMyTokenAccountsSelector = <T,>(
  selector: (multisigs: Record<string, TokenAccount>) => T,
) => {
  const tokenAccounts = useWalletStore(
    ({ tokenAccounts }) => selector(tokenAccounts),
    isEqual,
  )
  return tokenAccounts
}

/**
 * Get readable (undecimalized) token balance
 * @param tokenAddress Token Address
 * @returns Balance
 */
export const useMyReadableBalanceByTokenAddress = (tokenAddress: string) => {
  const { publicKey } = useWallet()
  const { decimals } = useTokenByAddress(tokenAddress) || { decimals: 0 }
  const balance = useMyTokenAccountsSelector<string>((tokenAccounts) => {
    if (!publicKey || !tokenAddress) return '0'
    const tokenAccount = utils.token.associatedAddress({
      mint: new PublicKey(tokenAddress),
      owner: publicKey,
    })
    const { amount } = tokenAccounts[tokenAccount.toBase58()] || {
      amount: new BN(0),
    }
    return undecimalize(amount, decimals)
  })
  return balance
}

/**
 * Get lamports balance
 */
export const useLamports = () => {
  const lamports = useWalletStore(({ lamports }) => lamports)
  return lamports
}
