import { ReactNode } from 'react'
import type { Metadata } from 'next'

import { PoolProvider } from '@/providers/pools.provider'

import PoolWatcher from '@/watchers/pool.watcher'

export const metadata: Metadata = {
  title: 'Liquidity Pools',
  description: 'Launch up to 8 types of tokens with limited funds.',
}

export default function PoolLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 gap-4 items-center">
      <PoolProvider>
        <div className="max-w-[1024px] w-full flex flex-row justify-center">
          {children}
        </div>
        {/* Background worker */}
        <PoolWatcher />
      </PoolProvider>
    </div>
  )
}