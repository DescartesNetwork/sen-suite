'use client'

import { TokenLogo, TokenSymbol } from '@/components/token'
import { Crown, Info } from 'lucide-react'
import FarmTimeline from './farmTimeline'
import FarmStatus from './farmStatus'
import FarmInfo from './farmInfo'

import { useFarmByAddress } from '@/providers/farming.provider'

export type FarmingCardProps = {
  farmAddress: string
}

export default function FarmingCard({ farmAddress }: FarmingCardProps) {
  const { inputMint } = useFarmByAddress(farmAddress)

  return (
    <div className="card rounded-box shadow hover:shadow-lg p-4 bg-base-100 grid grid-cols-12 gap-2 cursor-pointer transition-all">
      <div className="col-span-12 flex flex-row items-center gap-2">
        <TokenLogo mintAddress={inputMint.toBase58()} />
        <p className="font-bold flex-auto">
          <TokenSymbol mintAddress={inputMint.toBase58()} />
        </p>
        <FarmStatus farmAddress={farmAddress} />
      </div>
      <div className="col-span-12 flex flex-row items-center gap-2">
        <div className="dropdown dropdown-hover flex-auto">
          <label tabIndex={0} className="flex flex-row items-center gap-1">
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
        <FarmTimeline farmAddress={farmAddress} />
      </div>
      <div className="col-span-12 mt-8">
        <FarmInfo farmAddress={farmAddress} />
      </div>
    </div>
  )
}
