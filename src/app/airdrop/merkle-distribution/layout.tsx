import { ReactNode } from 'react'
import type { Metadata } from 'next'

import MerkleDistributionHeader from './header'

export const metadata: Metadata = {
  title: 'Merkle Distribution | Merkle Distribution for SPL Tokens on Solana',
}

export default function MerkleDistributionLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex w-full h-full flex-col gap-8 ">
      <MerkleDistributionHeader />
      <div>{children}</div>
    </div>
  )
}
