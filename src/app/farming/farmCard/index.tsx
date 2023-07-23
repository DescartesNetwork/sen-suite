'use client'
import { useRouter } from 'next/navigation'

import { MintLogo, MintSymbol } from '@/components/mint'
import { Crown, Info } from 'lucide-react'
import FarmTimeline from './farmTimeline'
import FarmStatus from './farmStatus'
import {
  FarmInfoApr,
  FarmInfoMyReward,
  FarmInfoRewardMint,
  FarmInfoTvl,
} from './farmInfo'

import { useFarmByAddress } from '@/providers/farming.provider'

export type FarmingCardProps = {
  farmAddress: string
}

export default function FarmCard({ farmAddress }: FarmingCardProps) {
  const { push } = useRouter()
  const { inputMint } = useFarmByAddress(farmAddress)

  return (
    <div
      className="card rounded-box shadow hover:shadow-lg p-4 bg-base-100 grid grid-cols-12 gap-2 cursor-pointer transition-all"
      onClick={() => push(`/farming/farm-details?farmAddress=${farmAddress}`)}
    >
      <div className="col-span-full flex flex-row items-center gap-2">
        <MintLogo mintAddress={inputMint.toBase58()} />
        <p className="font-bold flex-auto">
          <MintSymbol mintAddress={inputMint.toBase58()} />
        </p>
        <FarmStatus farmAddress={farmAddress} />
      </div>
      <div className="col-span-full flex flex-row flex-wrap items-center gap-2 mb-8">
        <div className="dropdown dropdown-hover">
          <label
            tabIndex={0}
            className="flex flex-row items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="w-3 h-3" />
            <p className="text-sm">Need stake tokens?</p>
          </label>
          <ul
            tabIndex={0}
            className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52"
          >
            <li>
              <a className="flex flex-row items-center" href="/swap/pools">
                <span className="flex-auto">Deposit in SenSwap</span>
                <Crown className="h-4 w-4 stroke-amber-500" />
              </a>
            </li>
          </ul>
        </div>
        <div className="flex-auto flex flex-row justify-end">
          <FarmTimeline farmAddress={farmAddress} />
        </div>
      </div>
      <div className="col-span-4 flex flex-col">
        <FarmInfoApr farmAddress={farmAddress} />
        <FarmInfoRewardMint farmAddress={farmAddress} />
      </div>
      <div className="col-span-4">
        <FarmInfoTvl farmAddress={farmAddress} />
      </div>
      <div className="col-span-4">
        <FarmInfoMyReward farmAddress={farmAddress} />
      </div>
    </div>
  )
}
