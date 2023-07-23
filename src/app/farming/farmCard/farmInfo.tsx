'use client'
import { useMemo } from 'react'
import BN from 'bn.js'

import { MintAmount, MintLogo } from '@/components/mint'

import { numeric } from '@/helpers/utils'
import { useFarmOracle } from '@/hooks/farming.hook'
import { useTvl } from '@/hooks/tvl.hook'
import {
  useDebtByFarmAddress,
  useFarmByAddress,
  useRewardsByFarmAddress,
} from '@/providers/farming.provider'

const YEAR = 365 * 24 * 60 * 60

export type FarmInfoProps = {
  farmAddress: string
}

export function FarmInfoApr({ farmAddress }: FarmInfoProps) {
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
    <div className="w-full flex flex-col gap-1">
      <p className="opacity-60">APR</p>
      <p className="font-bold text-lime-500">
        {numeric(apr).format('0.[00]%')}
      </p>
    </div>
  )
}

export function FarmInfoTvl({ farmAddress }: FarmInfoProps) {
  const { inputMint, totalShares } = useFarmByAddress(farmAddress)
  const inputMintAddress = useMemo(() => inputMint.toBase58(), [inputMint])
  const tvl = useTvl([{ mintAddress: inputMintAddress, amount: totalShares }])

  return (
    <div className="w-full flex flex-col gap-1">
      <p className="opacity-60">TVL</p>
      <p className="font-bold">{numeric(tvl).format('$0,0.[00]')}</p>
    </div>
  )
}

export function FarmInfoRewardMint({ farmAddress }: FarmInfoProps) {
  const rewards = useRewardsByFarmAddress(farmAddress) || {}

  return (
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
  )
}

export function FarmInfoMyReward({ farmAddress }: FarmInfoProps) {
  const { totalRewards } = useFarmByAddress(farmAddress)
  const rewards = useRewardsByFarmAddress(farmAddress)

  const myRewards = useMemo<Array<{ mintAddress: string; amount: BN }>>(
    () =>
      rewards.map(({ rewardMint, totalRewards: myTotalRewards }) => ({
        mintAddress: rewardMint.toBase58(),
        amount: totalRewards.mul(myTotalRewards),
      })),
    [rewards],
  )
  const reward = useTvl(myRewards)

  return (
    <div className="w-full flex flex-col gap-1">
      <p className="opacity-60">My Rewards</p>
      <p className="font-bold">{numeric(reward).format('%0.[00]')}</p>
    </div>
  )
}

export function FarmInfoMyStake({ farmAddress }: FarmInfoProps) {
  const { inputMint } = useFarmByAddress(farmAddress)
  const { shares } = useDebtByFarmAddress(farmAddress) || { shares: new BN(0) }

  return (
    <div className="w-full flex flex-col gap-1">
      <p className="opacity-60">My Stakes</p>
      <p className="font-bold">
        <MintAmount mintAddress={inputMint.toBase58()} amount={shares} />
      </p>
    </div>
  )
}

export function FarmInfoMyPosition({ farmAddress }: FarmInfoProps) {
  const { totalShares } = useFarmByAddress(farmAddress)
  const { shares } = useDebtByFarmAddress(farmAddress) || { shares: new BN(0) }

  const percentage = useMemo(
    () =>
      totalShares.isZero()
        ? 0
        : shares
            .mul(new BN(10 ** 9))
            .div(totalShares)
            .toNumber() /
          10 ** 9,
    [shares, totalShares],
  )

  return (
    <div className="w-full flex flex-col gap-1">
      <p className="opacity-60">My Position</p>
      <p className="font-bold">{numeric(percentage).format('%0.[00]')}</p>
    </div>
  )
}
