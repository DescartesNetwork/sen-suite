'use client'

import { MintLogo, MintSymbol } from '@/components/mint'

import { numeric } from '@/helpers/utils'
import { useTvl } from '@/hooks/tvl.hook'
import { useFarmByAddress } from '@/providers/farming.provider'

export type FarmInfoProps = {
  farmAddress: string
}

export default function FarmInfo({ farmAddress }: FarmInfoProps) {
  const { inputMint, totalShares, moMint } = useFarmByAddress(farmAddress)
  const tvl = useTvl({ [inputMint.toBase58()]: totalShares })

  const rewards = 0

  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-4 flex flex-col gap-1">
        <p className="opacity-60">APR</p>
      </div>
      <div className="col-span-4 flex flex-col gap-1">
        <p className="opacity-60">TVL</p>
        <p className="font-bold">{numeric(tvl).format('$0,0.[00]')}</p>
      </div>
      <div className="col-span-4 flex flex-col gap-1">
        <p className="opacity-60">Your Rewards</p>
        <p className="font-bold">{numeric(rewards).format('$0,0.[00]')}</p>
        <span className="flex flex-row gap-2 items-center text-sm">
          <MintLogo
            mintAddress={moMint.toBase58()}
            className="w-6 h-6 rounded-full bg-base-300"
            iconClassName="w-4 h-4 text-base-content"
          />
          <MintSymbol mintAddress={moMint.toBase58()} />
        </span>
      </div>
    </div>
  )
}
