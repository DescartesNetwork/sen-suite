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
  tokenAddress: string
  showBalance?: boolean
}

export default function TokenCard({
  tokenAddress,
  showBalance = false,
}: TokenCardProps) {
  return (
    <div className="group card w-full p-2 hover:bg-base-200 cursor-pointer">
      <div className="flex gap-2">
        <TokenLogo address={tokenAddress} />
        <div className="flex-auto">
          <p className="font-semibold">
            <TokenSymbol address={tokenAddress} />
          </p>
          <p className="text-sm opacity-60">
            <TokenName address={tokenAddress} />
          </p>
        </div>
        <div className="invisible group-hover:visible">
          <Clipboard content={tokenAddress} idleText="Copy Token Address" />
        </div>
        <div className="invisible group-hover:visible">
          <a
            className="btn btn-sm btn-ghost btn-square"
            href={solscan(tokenAddress)}
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
                <TokenSymbol address={tokenAddress} />
              </div>
            </div>
            <div className="text-sm">
              <MyTokenBalance address={tokenAddress} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
