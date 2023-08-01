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

/**
 * Create an MPL instanse
 * @returns MPL instance
 */
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

/**
 * Get NFT data
 * @param mintAddresses Mint addresses
 * @returns NFT data
 */
export const useNfts = (mintAddresses: string[]) => {
  const mpl = useMpl()
  const fetcher = useCallback(
    async ([mintAddresses]: [string[]]) => {
      const data = await Promise.all(
        mintAddresses.map((mintAddress) =>
          isAddress(mintAddress)
            ? mpl.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) })
            : undefined,
        ),
      )
      return data
    },
    [mpl],
  )
  const { data } = useSWR([mintAddresses, 'mpl'], fetcher)
  return data || []
}
