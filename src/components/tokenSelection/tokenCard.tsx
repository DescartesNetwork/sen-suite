'use client'

import Clipboard from '@/components/clipboard'
import {
  MyTokenBalance,
  TokenLogo,
  TokenName,
  TokenSymbol,
} from '@/components/token'
import { ArrowUpRightSquare } from 'lucide-react'

import { solscan } from '@/helpers/explorers'

export type TokenCardProps = {
  mintAddress: string
  onClick?: () => void
  active?: boolean
  showBalance?: boolean
}

export default function TokenCard({
  mintAddress,
  onClick = () => {},
  active = false,
  showBalance = false,
}: TokenCardProps) {
  return (
    <div
      className={
        'group card w-full p-2 hover:bg-base-200 cursor-pointer' +
        (active ? ' bg-accent' : '')
      }
      onClick={onClick}
    >
      <div className="flex gap-2">
        <TokenLogo mintAddress={mintAddress} />
        <div className="flex-auto">
          <p className="font-semibold">
            <TokenSymbol mintAddress={mintAddress} />
          </p>
          <p className="text-sm opacity-60">
            <TokenName mintAddress={mintAddress} />
          </p>
        </div>
        <div className="invisible group-hover:visible">
          <Clipboard content={mintAddress} idleText="Copy Token Address" />
          <a
            className="btn btn-sm btn-ghost btn-square"
            href={solscan(mintAddress)}
            target="_blank"
            rel="noreferrer"
          >
            <ArrowUpRightSquare className="w-4 h-4" />
          </a>
        </div>
        {showBalance && (
          <div className="flex flex-col gap-1 items-end group-hover:hidden">
            <div className="flex flex-row">
              <div className="text-xs opacity-60">My Balance</div>
              <div className="divider divider-horizontal mx-0 my-1" />
              <div className="text-xs opacity-60">
                <TokenSymbol mintAddress={mintAddress} />
              </div>
            </div>
            <div className="text-sm">
              <MyTokenBalance mintAddress={mintAddress} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
