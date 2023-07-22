'use client'
import { Fragment, ReactNode, useCallback, useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import Fuse from 'fuse.js'
import { keccak_256 } from '@noble/hashes/sha3'
import BN from 'bn.js'
import { v4 as uuid } from 'uuid'
import useSWR from 'swr'
import { PublicKey } from '@solana/web3.js'
import { produce } from 'immer'

import { env } from '@/configs/env'
import { useMpl } from '@/hooks/mpl.hook'
import { getAllTokens, getPrice } from '@/helpers/jup.ag'

export type MintStore = {
  mints: MintMetadata[]
  upsertMints: (newMints: MintMetadata[]) => void
  prices: Record<string, number>
  upsertPrices: (newPrices: Record<string, number>) => void
  engine?: Fuse<MintMetadata>
  setEngine: (engine?: Fuse<MintMetadata>) => void
  unmount: () => void
}

/**
 * Store
 */
export const useMintStore = create<MintStore>()(
  devtools(
    (set) => ({
      mints: [],
      upsertMints: (newMints: MintMetadata[]) =>
        set(
          produce<MintStore>(({ mints }) => {
            newMints.forEach((newMint) => {
              const index = mints.findIndex(
                ({ address }) => address === newMint.address,
              )
              if (index >= 0) Object.assign(mints[index], newMint)
              else mints.push(newMint)
            })
          }),
          false,
          'setMints',
        ),
      prices: {},
      upsertPrices: (newPrices) =>
        set(
          produce<MintStore>(({ prices }) => {
            Object.keys(newPrices).forEach((mintAddress) => {
              if (!prices[mintAddress])
                prices[mintAddress] = newPrices[mintAddress]
              else Object.assign(prices[mintAddress], newPrices[mintAddress])
            })
          }),
        ),
      engine: undefined,
      setEngine: (engine?: Fuse<MintMetadata>) =>
        set({ engine }, false, 'setEngine'),
      unmount: () => set({ mints: [], engine: undefined }, false, 'unmount'),
    }),
    {
      name: 'mint',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */

export default function MintProvider({ children }: { children: ReactNode }) {
  const upsertMints = useMintStore(({ upsertMints }) => upsertMints)
  const setEngine = useMintStore(({ setEngine }) => setEngine)
  const unmount = useMintStore(({ unmount }) => unmount)

  const fetch = useCallback(async () => {
    const data = await getAllTokens()
    const fuse = new Fuse<MintMetadata>(data, {
      includeScore: true,
      keys: ['name', 'symbol'],
    })
    upsertMints(data)
    setEngine(fuse)
  }, [upsertMints, setEngine])

  useEffect(() => {
    fetch()
    return unmount
  }, [fetch, unmount])

  return <Fragment>{children}</Fragment>
}

/**
 * Get all mints
 * @returns Mint list
 */
export const useAllMints = () => {
  const mints = useMintStore(({ mints }) => mints)
  return mints
}

/**
 * Get random mints
 * @param opt.seed Deterministic randomization
 * @param opt.limit How large the list is
 * @returns Mint list
 */
export const useRandomMints = ({
  seed,
  limit = 50,
}: {
  seed?: string
  limit?: number
} = {}): MintMetadata[] => {
  const mints = useMintStore(({ mints }) => mints)
  const _seed = useMemo(
    () => keccak_256(new TextEncoder().encode(seed || uuid())),
    [seed],
  )
  const _limit = useMemo(() => Math.max(1, limit), [limit])
  const randTokens = useMemo(() => {
    if (mints.length < _limit) return mints
    const red = BN.red(new BN(mints.length))
    const index = new BN(_seed).toRed(red).toNumber()
    return mints.slice(index, index + _limit)
  }, [mints, _limit, _seed])
  return randTokens
}

/**
 * Get mint by address
 * @param mintAddress Mint address
 * @returns Mint
 */
export const useMintByAddress = (mintAddress: string) => {
  const mint = useMintStore(({ mints }) =>
    mints.find(({ address }) => address === mintAddress),
  )
  return mint
}

export const useSftByAddress = (mintAddress: string) => {
  const mpl = useMpl()
  const { data } = useSWR([mintAddress, 'sft'], async ([mintAddress]) => {
    const data = await mpl
      .nfts()
      .findByMint({ mintAddress: new PublicKey(mintAddress) })
    const onchainMint: MintMetadata = {
      address: mintAddress,
      chainId: 101,
      decimals: data.mint.decimals,
      name: data.name,
      symbol: data.symbol,
      logoURI: data.json?.image || '',
      tags: ['sft'],
      extensions: {},
    }
    return onchainMint
  })

  return data
}

/**
 * Semantic search mint
 * @returns Mint list
 */
export const useSearchMint = () => {
  const engine = useMintStore(({ engine }) => engine)
  const search = useCallback(
    (text: string) => {
      if (!engine) return []
      return engine.search(text)
    },
    [engine],
  )
  return search
}

/**
 * Get mint prices
 * @param mintAddresses Mint addresses
 * @returns Prices
 */
export const usePrices = (mintAddresses: string[]) => {
  const prices = useMintStore(({ prices }) => prices)
  const upsertPrices = useMintStore(({ upsertPrices }) => upsertPrices)
  const getPrices = useCallback(
    async (mintAddresses: string[]) => {
      const data = await Promise.all(
        mintAddresses.map(async (mintAddress) => {
          if (prices[mintAddress] !== undefined) return prices[mintAddress]
          const price = await getPrice(mintAddress)
          return price
        }),
      )
      const mapping: Record<string, number> = {}
      mintAddresses.forEach(
        (mintAddress, i) => (mapping[mintAddress] = data[i]),
      )
      upsertPrices(mapping)
      return data
    },
    [prices, upsertPrices],
  )
  const { data } = useSWR([mintAddresses, 'prices'], ([mintAddresses]) =>
    getPrices(mintAddresses),
  )

  return data
}
