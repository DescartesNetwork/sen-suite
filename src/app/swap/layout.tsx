import { ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sentre Swap | Sentre',
  description:
    'The asymmetric pools (Balancer model) on Solana. Powered by Sentre.',
}

export default function SwapLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 justify-center gap-4">
      <div className="w-full flex flex-col gap-4 items-center">
        <div role="tablist" className="tabs tabs-boxed">
          <a role="tab" className="tab tab-active">
            Swap
          </a>
          <Link role="tab" className="tab" href="/pools">
            Liquidity Pools
          </Link>
        </div>
        <div className="max-w-[360px]">{children}</div>
      </div>
    </div>
  )
}
