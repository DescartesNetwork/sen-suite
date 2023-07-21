'use client'
import { Fragment, ReactNode, useCallback, useEffect, useMemo } from 'react'
import axios from 'axios'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import Fuse from 'fuse.js'
import { keccak_256 } from '@noble/hashes/sha3'
import BN from 'bn.js'
import { v4 as uuid } from 'uuid'

import { env } from '@/configs/env'

export type MintStore = {
  mints: MintMetadata[]
  setMints: (mints: MintMetadata[]) => void
  engine?: Fuse<MintMetadata>
  setEngine: (engine?: Fuse<MintMetadata>) => void
}

/**
 * Store
 */
export const useMintStore = create<MintStore>()(
  devtools(
    (set) => ({
      mints: [],
      setMints: (mints: MintMetadata[]) => set({ mints }, false, 'setMints'),
      engine: undefined,
      setEngine: (engine?: Fuse<MintMetadata>) =>
        set({ engine }, false, 'setEngine'),
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
  const setMints = useMintStore(({ setMints }) => setMints)
  const setEngine = useMintStore(({ setEngine }) => setEngine)

  const fetch = useCallback(async () => {
    const { data } = await axios.get<MintMetadata[]>('https://token.jup.ag/all')
    const fuse = new Fuse<MintMetadata>(data, {
      includeScore: true,
      keys: ['name', 'symbol'],
    })
    setMints(data)
    setEngine(fuse)
  }, [setMints, setEngine])

  const unmount = useCallback(() => {
    setMints([])
    setEngine(undefined)
  }, [setMints, setEngine])

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
 * @param addr Mint address
 * @returns Mint
 */
export const useMintByAddress = (addr: string) => {
  const mints = useMintStore(({ mints }) => mints)
  const mint = useMemo(
    () => mints.find(({ address }) => address === addr),
    [mints, addr],
  )
  return mint
}

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
