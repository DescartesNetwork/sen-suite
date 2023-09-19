import { ReactNode } from 'react'
import type { Metadata } from 'next'

import { LaunchpadProvider } from '@/providers/launchpad.provider'
import { PoolProvider } from '@/providers/pools.provider'

export const metadata: Metadata = {
  title: 'Launchpad',
  description:
    'The Native Decentralized Launchpad for projects building on Solana.',
}

export default function LaunchpadLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 gap-4 items-center">
      <PoolProvider>
        <LaunchpadProvider>
          <div className="max-w-[1024px] w-full flex flex-row justify-center">
            {children}
          </div>
        </LaunchpadProvider>
      </PoolProvider>
    </div>
  )
}
