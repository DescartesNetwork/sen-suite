'use client'

import { MyBalance, MintLogo, MintName, MintSymbol } from '@/components/mint'
import Clipboard from '@/components/clipboard'
import NewWindow from '@/components/newWindow'

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
        <MintLogo mintAddress={mintAddress} />
        <div className="flex-auto">
          <p className="font-semibold">
            <MintSymbol mintAddress={mintAddress} />
          </p>
          <p className="text-sm opacity-60">
            <MintName mintAddress={mintAddress} />
          </p>
        </div>
        <div className="invisible group-hover:visible">
          <Clipboard content={mintAddress} idleText="Copy Token Address" />
          <NewWindow href={solscan(mintAddress)} />
        </div>
        {showBalance && (
          <div className="flex flex-col gap-1 items-end group-hover:hidden">
            <div className="flex flex-row">
              <div className="text-xs opacity-60">My Balance</div>
              <div className="divider divider-horizontal mx-0 my-1" />
              <div className="text-xs opacity-60">
                <MintSymbol mintAddress={mintAddress} />
              </div>
            </div>
            <div className="text-sm">
              <MyBalance mintAddress={mintAddress} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
