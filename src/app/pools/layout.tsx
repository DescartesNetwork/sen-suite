import { ReactNode } from 'react'
import type { Metadata } from 'next'

import { PoolProvider } from '@/providers/pools.provider'

export const metadata: Metadata = {
  title: 'Sentre Pools | Sentre',
  description: 'Launch up to 8 types of tokens with limited funds.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 gap-4 items-center">
      <div className="w-full flex flex-row justify-center">
        <PoolProvider>{children}</PoolProvider>
      </div>
    </div>
  )
}
