'use client'
import { Fragment, ReactNode } from 'react'
import axios from 'axios'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { env } from '@/configs/env'
import { useMount, useUnmount } from 'react-use'

export type TokenStore = {
  tokens: TokenMetadata[]
  setTokens: (tokens: TokenMetadata[]) => void
}

export const useTokenStore = create<TokenStore>()(
  devtools(
    (set) => ({
      tokens: [],
      setTokens: (tokens: TokenMetadata[]) => set({ tokens }),
    }),
    {
      name: 'tokens',
      enabled: env === 'development',
    },
  ),
)

export default function TokenProvider({ children }: { children: ReactNode }) {
  const setTokens = useTokenStore(({ setTokens }) => setTokens)

  useMount(async () => {
    const { data } = await axios.get('https://token.jup.ag/all')
    return setTokens(data)
  })

  useUnmount(() => {
    return setTokens([])
  })

  return <Fragment>{children}</Fragment>
}
