import { useCallback, useMemo } from 'react'
import BN from 'bn.js'
import { utils, web3 } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'

import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { useLamports } from '@/providers/wallet.provider'
import { initializeTokenAccount, useSpl } from './spl.hook'
import { confirmTransaction } from '@/helpers/explorers'

export const WRAPPED_SOL = 'So11111111111111111111111111111111111111112'

/**
 * Wrap SOL
 */
export function useWrap() {
  const { publicKey, sendTransaction } = useWallet()
  const spl = useSpl()
  const lamports = useLamports()

  const wsolTokenAccount = useMemo(
    () =>
      publicKey &&
      utils.token.associatedAddress({
        mint: new web3.PublicKey(WRAPPED_SOL),
        owner: publicKey,
      }),
    [publicKey],
  )
  const initialized = !!useTokenAccountByMintAddress(WRAPPED_SOL)

  const wrap = useCallback(
    async (amount: BN, sendAndConfirm = true) => {
      if (!publicKey || !wsolTokenAccount)
        throw new Error('Not connected wallet yet.')
      if (amount.gte(new BN(lamports)))
        throw new Error('Insufficient SOL balance.')
      const tx = new web3.Transaction()
      if (!initialized)
        tx.add(
          initializeTokenAccount({
            mint: new web3.PublicKey(WRAPPED_SOL),
            owner: publicKey,
          }),
        )
      tx.add(
        web3.SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: wsolTokenAccount,
          lamports: BigInt(amount.toString()),
        }),
        await spl.methods
          .syncNative()
          .accounts({ account: wsolTokenAccount })
          .instruction(),
      )
      let txId = ''
      if (sendAndConfirm) {
        txId = await sendTransaction(tx, spl.provider.connection)
        await confirmTransaction(txId, spl.provider.connection)
      }
      return { tx, txId }
    },
    [lamports, publicKey, wsolTokenAccount, initialized, spl, sendTransaction],
  )

  return wrap
}

/**
 * Unwrap SOL
 */
export function useUnwrap() {
  const { publicKey, sendTransaction } = useWallet()
  const spl = useSpl()

  const wsolTokenAccount = useMemo(
    () =>
      publicKey &&
      utils.token.associatedAddress({
        mint: new web3.PublicKey(WRAPPED_SOL),
        owner: publicKey,
      }),
    [publicKey],
  )

  const unwrap = useCallback(
    async (sendAndConfirm = true) => {
      if (!publicKey || !wsolTokenAccount)
        throw new Error('Not connected wallet yet.')
      const tx = await spl.methods
        .closeAccount()
        .accounts({
          account: wsolTokenAccount,
          destination: publicKey,
          owner: publicKey,
        })
        .transaction()
      let txId = ''
      if (sendAndConfirm) {
        txId = await sendTransaction(tx, spl.provider.connection)
        await confirmTransaction(txId, spl.provider.connection)
      }
      return { tx, txId }
    },
    [wsolTokenAccount, publicKey, sendTransaction, spl],
  )

  return unwrap
}
