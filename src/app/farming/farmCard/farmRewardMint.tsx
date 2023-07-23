'use client'

import { MintLogo } from '@/components/mint'

import { useRewardsByFarmAddress } from '@/providers/farming.provider'

export type FarmRewardMintProps = {
  farmAddress: string
}

export default function FarmRewardMint({ farmAddress }: FarmRewardMintProps) {
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
