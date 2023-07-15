'use client'
import { Fragment, ReactNode, useCallback, useMemo } from 'react'
import axios from 'axios'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import Fuse from 'fuse.js'
import { keccak_256 } from '@noble/hashes/sha3'
import BN from 'bn.js'
import { v4 as uuid } from 'uuid'

import { env } from '@/configs/env'
import { useMount, useUnmount } from 'react-use'

const EMPTY_TOKEN_METADATA: TokenMetadata = {
  address: '',
  name: 'Unknown Token',
  symbol: 'UNKNOWN',
  logoURI: '',
  decimals: 0,
  chainId: 101,
  extensions: {},
  tags: [],
}

/**
 * Store
 */

export type TokenStore = {
  tokens: TokenMetadata[]
  setTokens: (tokens: TokenMetadata[]) => void
  engine?: Fuse<TokenMetadata>
  setEngine: (engine?: Fuse<TokenMetadata>) => void
}

export const useTokenStore = create<TokenStore>()(
  devtools(
    (set) => ({
      tokens: [],
      setTokens: (tokens: TokenMetadata[]) => set({ tokens }),
      engine: undefined,
      setEngine: (engine?: Fuse<TokenMetadata>) => set({ engine }),
    }),
    {
      name: 'tokens',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */

export default function TokenProvider({ children }: { children: ReactNode }) {
  const { setTokens, setEngine } = useTokenStore(
    ({ setTokens, setEngine }) => ({ setTokens, setEngine }),
  )

  useMount(async () => {
    const { data } = await axios.get<TokenMetadata[]>(
      'https://token.jup.ag/all',
    )
    const fuse = new Fuse<TokenMetadata>(data, {
      includeScore: true,
      keys: ['name', 'symbol'],
    })
    setTokens(data)
    setEngine(fuse)
  })

  useUnmount(() => {
    setTokens([])
    setEngine(undefined)
  })

  return <Fragment>{children}</Fragment>
}

/**
 * Hooks
 */

export const useAllTokens = () => {
  const tokens = useTokenStore(({ tokens }) => tokens)
  return tokens
}

export const useRandomTokens = ({
  seed,
  limit = 50,
}: {
  seed?: string
  limit?: number
} = {}) => {
  const tokens = useTokenStore(({ tokens }) => tokens)
  const _seed = useMemo(
    () => keccak_256(new TextEncoder().encode(seed || uuid())),
    [seed],
  )
  const _limit = useMemo(() => Math.max(1, limit), [limit])
  const randTokens = useMemo(() => {
    if (tokens.length < _limit) return tokens
    const red = BN.red(new BN(tokens.length))
    const index = new BN(_seed).toRed(red).toNumber()
    return tokens.slice(index, index + _limit)
  }, [tokens, _limit, _seed])
  return randTokens
}

export const useTokenByAddress = (addr: string) => {
  const tokens = useTokenStore(({ tokens }) => tokens)
  const token = useMemo(
    () =>
      tokens.find(({ address }) => address === addr) || EMPTY_TOKEN_METADATA,
    [tokens, addr],
  )
  return token
}

export const useSearchToken = () => {
  const engine = useTokenStore(({ engine }) => engine)
  const search = useCallback(
    (text: string) => {
      if (!engine) return []
      return engine.search(text)
    },
    [engine],
  )
  return search
}
