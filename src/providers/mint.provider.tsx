'use client'
import { Fragment, ReactNode, useCallback, useEffect, useMemo } from 'react'
import axios from 'axios'
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

export type MintStore = {
  mints: MintMetadata[]
  upsertMints: (newMints: MintMetadata[]) => void
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
              if (index >= 0)
                mints[index] = Object.assign(mints[index], newMint)
              else mints.push(newMint)
            })
          }),
          false,
          'setMints',
        ),
      engine: undefined,
      setEngine: (engine?: Fuse<MintMetadata>) =>
        set({ engine }, false, 'setEngine'),
      unmount: () => set({ mints: [], engine: undefined }, false, 'unmount'),
    }),
    {
      name: 'token',
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
    const { data } = await axios.get<MintMetadata[]>('https://token.jup.ag/all')
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
 * Get mint price
 * @param symbol Mint symbol
 * @returns Price
 */
export const getPrice = async (mintAddress: string) => {
  try {
    const {
      data: {
        data: {
          [mintAddress]: { price },
        },
      },
    } = await axios.get<{
      data: Record<string, { price: number }>
      timeTake: number
    }>(`https://price.jup.ag/v4/price?ids=${mintAddress}`)
    return price
  } catch (er) {
    return 0
  }
}
export const usePrice = (mintAddress: string) => {
  const { data } = useSWR([mintAddress, 'price'], ([mintAddress]) =>
    getPrice(mintAddress),
  )
  return data || 0
}
