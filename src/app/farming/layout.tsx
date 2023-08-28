import { ReactNode } from 'react'
import type { Metadata } from 'next'

import FarmingProvider from '@/providers/farming.provider'
import FarmingWatcher from '@/watchers/farming.watcher'

export const metadata: Metadata = {
  title: 'SenFarming',
  description: 'Boost your TVL and NFT utility along each other.',
}

export default function FarmingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 gap-4 items-center">
      <FarmingProvider>
        <div className="max-w-[1024px] w-full grid grid-cols-12 gap-x-2 gap-y-4">
          <div className="col-span-full">{children}</div>
        </div>

        {/* Services worker */}
        <FarmingWatcher />
      </FarmingProvider>
    </div>
  )
}
