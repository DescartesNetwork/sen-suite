'use client'
import { useCallback, useMemo, useState } from 'react'
import { Wallet } from '@solana/wallet-adapter-react'
import copy from 'copy-to-clipboard'

import { ArrowUpRightSquare, Copy, LogOut } from 'lucide-react'
import { WalletIcon } from '@solana/wallet-adapter-react-ui'

import { asyncWait, shortenAddress } from '@/helpers/utils'
import { solscan } from '@/helpers/explorers'

export type WalletInfoProps = {
  wallet: Wallet
  onDisconnect?: () => void
}

export default function WalletInfo({
  wallet,
  onDisconnect = () => {},
}: WalletInfoProps) {
  const [copied, setCopied] = useState(false)

  const address = useMemo(
    () => wallet.adapter.publicKey?.toBase58() || '',
    [wallet.adapter.publicKey],
  )

  const onCopy = useCallback(async () => {
    copy(address)
    setCopied(true)
    await asyncWait(1500)
    return setCopied(false)
  }, [address])

  const tolltipClassName = copied ? 'tooltip tooltip-open' : 'tooltip'
  const tolltipText = copied ? 'Copied' : 'Copy'

  return (
    <li className="dropdown">
      <label tabIndex={0}>
        <WalletIcon className="avatar h-5 w-5" wallet={wallet} />
        <p className="menu-option font-semibold">{shortenAddress(address)}</p>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] !menu-md p-2 shadow-xl bg-base-100 rounded-box !w-48"
      >
        <li>
          <a className="flex w-full" onClick={onCopy}>
            <span className="flex-auto">Copy Address</span>
            <span className={tolltipClassName} data-tip={tolltipText}>
              <Copy className="h-4 w-4" />
            </span>
          </a>
        </li>
        <li>
          <a
            className="flex w-full"
            href={solscan(address)}
            target="_blank"
            rel="noreferrer"
          >
            <span className="flex-auto">View on Explorer</span>
            <ArrowUpRightSquare className="h-4 w-4" />
          </a>
        </li>
        <li>
          <a className="flex w-full link-error" onClick={onDisconnect}>
            <span className="flex-auto">Disconnect</span>
            <LogOut className="h-4 w-4" />
          </a>
        </li>
      </ul>
    </li>
  )
}
