'use client'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import NewPoolProvider from '@/providers/newPool.provider'

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="w-full h-full flex flex-col gap-6 justify-center items-center">
      <ul className="w-full steps">
        <li
          className={clsx('step', {
            'text-primary step-primary': pathname.startsWith(
              '/pools/new-pool/pool-structure',
            ),
          })}
        >
          Pool Structure
        </li>
        <li
          className={clsx('step', {
            'text-primary step-primary': pathname.startsWith(
              '/pools/new-pool/set-liquidity',
            ),
          })}
        >
          Set Liquidity
        </li>
        <li
          className={clsx('step', {
            'text-primary step-primary': pathname.startsWith(
              '/pools/new-pool/review-start',
            ),
          })}
        >
          Review & Start
        </li>
      </ul>
      <NewPoolProvider>{children}</NewPoolProvider>
    </div>
  )
}
