'use client'

import { Wallet } from 'lucide-react'

export type WalletConnectProps = {
  onClick: () => void
}

export default function WalletConnect({ onClick }: WalletConnectProps) {
  return (
    <li>
      <button className="" onClick={onClick}>
        <Wallet className="menu-logo" />
        <p className="menu-option font-semibold">Connect Wallet</p>
      </button>
    </li>
  )
}
