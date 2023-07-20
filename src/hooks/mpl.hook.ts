import {
  Metaplex,
  PublicKey,
  bundlrStorage,
  walletAdapterIdentity,
} from '@metaplex-foundation/js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useMemo } from 'react'
import useSWR from 'swr'

import { isAddress } from '@/helpers/utils'

export const useMpl = () => {
  const { connection } = useConnection()
  const { wallet } = useWallet()
  const mpl = useMemo(() => {
    if (!wallet) return new Metaplex(connection)
    return Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet.adapter))
      .use(bundlrStorage())
  }, [connection, wallet])
  return mpl
}

export const useNft = (mintAddress: string) => {
  const mpl = useMpl()
  const fetcher = useCallback(
    async ([mintAddress]: [string]) => {
      if (!isAddress(mintAddress)) return undefined
      const data = await mpl
        .nfts()
        .findByMint({ mintAddress: new PublicKey(mintAddress) })
      return data
    },
    [mpl],
  )
  const { data } = useSWR([mintAddress, 'mpl'], fetcher)
  return data
}
