import { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Airdrop | Build your effective airdrop, vesting, bucksender campaigns',
}

export default function FarmingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 gap-4 justify-center items-center">
      {children}
    </div>
  )
}
