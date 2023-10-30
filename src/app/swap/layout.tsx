import { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SenSwap | Sentre',
  description:
    'SenSwap: The asymmetric pools (Balancer model) on Solana. Powered by Sentre.',
}

export default function SwapLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 justify-center gap-4">
      <div className="flex flex-row w-full justify-center">
        <div className="max-w-[360px]">{children}</div>
      </div>
    </div>
  )
}
