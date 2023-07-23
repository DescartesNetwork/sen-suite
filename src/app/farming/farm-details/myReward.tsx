'use client'

import { MintLogo, MintPrice, MintSymbol } from '@/components/mint'

import { useRewardsByFarmAddress } from '@/providers/farming.provider'
import { useFarmOracle } from '@/hooks/farming.hook'

export type MyRewardProps = {
  farmAddress: string
}

export default function MyReward({ farmAddress }: MyRewardProps) {
  const rewards = useRewardsByFarmAddress(farmAddress)
  const { lifetime } = useFarmOracle(farmAddress)

  return (
    <div className="grid grid-cols-12 gap-4">
      <p className="col-span-full mb-4">My Rewards</p>
      {rewards.map(({ rewardMint, totalRewards }) => (
        <div
          key={rewardMint.toBase58()}
          className="col-span-full grid grid-cols-12 gap-0"
        >
          <div className="col-span-full flex flex-row items-center gap-2">
            <MintLogo
              mintAddress={rewardMint.toBase58()}
              className="w-8 h-8 rounded-full bg-base-300"
            />
            <span className="flex flex-col gap-0 flex-auto">
              <p className="font-bold opacity-60">
                <MintSymbol mintAddress={rewardMint.toBase58()} />
              </p>
              <p className="opacity-60">
                <MintPrice mintAddress={rewardMint.toBase58()} />
              </p>
            </span>
          </div>
        </div>
      ))}
      <button className="col-span-full btn btn-primary btn-sm">Harvest</button>
    </div>
  )
}
