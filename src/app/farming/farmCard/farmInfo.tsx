'use client'
import { useMemo } from 'react'

import { MintLogo } from '@/components/mint'

import { numeric } from '@/helpers/utils'
import { useFarmOracle } from '@/hooks/farming.hook'
import { useTvl } from '@/hooks/tvl.hook'
import {
  useFarmByAddress,
  useRewardsByFarmAddress,
} from '@/providers/farming.provider'

const YEAR = 365 * 24 * 60 * 60

export type FarmInfoProps = {
  farmAddress: string
}

export default function FarmInfo({ farmAddress }: FarmInfoProps) {
  const { inputMint, totalShares } = useFarmByAddress(farmAddress)
  const inputMintAddress = useMemo(() => inputMint.toBase58(), [inputMint])
  const rewards = useRewardsByFarmAddress(farmAddress) || {}

  const { lifetime } = useFarmOracle(farmAddress)
  const tvl = useTvl([{ mintAddress: inputMintAddress, amount: totalShares }])
  const totalReward = useTvl(
    rewards.map(({ rewardMint, totalRewards }) => ({
      mintAddress: rewardMint.toBase58(),
      amount: totalRewards,
    })),
  )
  const rewardPerYear = (totalReward * YEAR) / lifetime.toNumber()
  const apr = rewardPerYear / Math.max(tvl, 100)

  return (
    <div className="grid grid-cols-12 gap-1">
      <div className="col-span-4 flex flex-col gap-1">
        <p className="opacity-60">APR</p>
        <p className="font-bold text-lime-500">
          {numeric(apr).format('0.[00]%')}
        </p>
        <span className="avatar-group -space-x-3">
          {rewards.map(({ rewardMint }) => (
            <MintLogo
              key={rewardMint.toBase58()}
              mintAddress={rewardMint.toBase58()}
              className="w-6 h-6 rounded-full bg-base-300"
              iconClassName="w-4 h-4 text-base-content"
            />
          ))}
        </span>
      </div>
      <div className="col-span-4 flex flex-col gap-1">
        <p className="opacity-60">TVL</p>
        <p className="font-bold">{numeric(tvl).format('$0,0.[00]')}</p>
      </div>
      <div className="col-span-4 flex flex-col gap-1">
        <p className="opacity-60">Your Rewards</p>
        <p className="font-bold">{numeric(0).format('$0,0.[00]')}</p>
      </div>
    </div>
  )
}
