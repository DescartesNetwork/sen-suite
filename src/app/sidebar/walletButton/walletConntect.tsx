'use client'

import { Wallet } from 'lucide-react'

export type WalletConnectProps = {
  onClick: () => void
}

export default function WalletConnect({ onClick }: WalletConnectProps) {
  return (
    <div
      className="px-4 py-3 flex flex-row gap-2 hover:bg-neutral hover:text-neutral-100 rounded-lg cursor-pointer"
      onClick={onClick}
    >
      <Wallet strokeWidth={1.5} className="menu-logo" />
      <p className="menu-option font-semibold">Connect Wallet</p>
    </div>
  )
}
