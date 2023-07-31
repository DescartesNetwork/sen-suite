import { useCallback, useMemo } from 'react'
import { AnchorProvider } from '@coral-xyz/anchor'
import { splTokenProgram } from '@coral-xyz/spl-token'
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from '@solana/wallet-adapter-react'
import { SystemProgram } from '@solana/web3.js'
import useSWR from 'swr'

import { isAddress } from '@/helpers/utils'

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

export const useMints = (mintAddresses: string[]) => {
  const spl = useSpl()
  const fetcher = useCallback(
    async ([mintAddresses]: [string[]]) => {
      for (const mintAddress of mintAddresses)
        if (!isAddress(mintAddress)) return undefined
      const data = await spl.account.mint.fetchMultiple(mintAddresses)
      return data
    },
    [spl],
  )
  const { data } = useSWR([mintAddresses, 'spl'], fetcher)
  return data || []
}
