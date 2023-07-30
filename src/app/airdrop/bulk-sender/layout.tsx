import { ReactNode } from 'react'
import type { Metadata } from 'next'

import BulkSenderHeader from './header'

export const metadata: Metadata = {
  title: 'Bulk Sender | Bulk Sender for SPL Tokens on Solana',
}

export default function BulkSenderLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="card bg-base-100 p-4 rounded-box shadow-xl grid grid-cols-12 gap-6 max-w-[480px]">
      <div className="col-span-12">
        <BulkSenderHeader />
      </div>
      <div className="col-span-12">{children}</div>
    </div>
  )
}
