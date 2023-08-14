import { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liquidity Pool',
  description: 'Launch up to 8 types of tokens with limited funds.',
}

export default function PoolLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 gap-4 items-center">
      <div className="max-w-[1024px] w-full grid grid-cols-12 gap-x-2 gap-y-4">
        {children}
      </div>
    </div>
  )
}
