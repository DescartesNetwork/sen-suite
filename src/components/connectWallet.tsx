'use client'
import { Fragment, ReactNode } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export type ConnectWalletProps = {
  children: ReactNode
  className?: string
}

export default function ConnectWallet({
  className = 'btn btn-primary',
  children,
}: ConnectWalletProps) {
  const { publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  if (!publicKey)
    return (
      <button className={className} onClick={() => setVisible(true)}>
        Connect Wallet
      </button>
    )
  return <Fragment>{children}</Fragment>
}
