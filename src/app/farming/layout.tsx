import { ReactNode } from 'react'
import type { Metadata } from 'next'

import FarmingPanel from './panel'
import FarmingNavigation from './navigation'
import FarmingSearch from './search'

import FarmingProvider from '@/providers/farming.provider'

export const metadata: Metadata = {
  title: 'SenFarming - v2 | Sentre: The suite for startups on Solana',
}

export default function FarmingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 gap-4">
      <div className="flex flex-row justify-center">
        <FarmingProvider>
          <div className="max-w-[1024px] w-full grid grid-cols-12 gap-x-2 gap-y-4">
            <div className="col-span-full">
              <FarmingPanel />
            </div>
            <div className="col-span-full flex flex-row gap-2 overflow-auto no-scrollbar">
              <FarmingNavigation />
            </div>
            <div className="col-span-full">
              <FarmingSearch />
            </div>
            <div className="col-span-full">{children}</div>
          </div>
        </FarmingProvider>
      </div>
    </div>
  )
}
