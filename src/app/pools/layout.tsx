import { ReactNode } from 'react'
import type { Metadata } from 'next'

import PoolProvider from '@/providers/pools.provider'
import { PoolStatProvider } from '@/providers/stat.provider'

export const metadata: Metadata = {
  title: 'Liquidity Pool | Sentre',
  description:
    'Launch your liquidity pools with weighted tokens up to 8 types.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 gap-4 items-center">
      <PoolProvider>
        <PoolStatProvider>{children}</PoolStatProvider>
      </PoolProvider>
    </div>
  )
}
