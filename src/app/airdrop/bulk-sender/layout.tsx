import { ReactNode } from 'react'
import type { Metadata } from 'next'

import BulkSenderHeader from './header'

import { BulkSenderProvider } from '@/providers/bulkSender.provider'

export const metadata: Metadata = {
  title: 'Bulk Sender | Bulk Sender for SPL Tokens on Solana',
}

export default function BulkSenderLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <BulkSenderProvider>
      <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="max-w-[480px]">
          <BulkSenderHeader />
          <div className="card bg-base-100 p-6 rounded-box shadow-xl grid grid-cols-12 gap-6 ">
            <div className="col-span-12">
              <h5 className="mb-2">Bulk Sender</h5>
            </div>
            <div className="col-span-12">{children}</div>
          </div>
        </div>
      </div>
    </BulkSenderProvider>
  )
}
