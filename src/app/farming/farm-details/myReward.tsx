'use client'

import {
  MintAmount,
  MintLogo,
  MintPrice,
  MintSymbol,
  MintValue,
} from '@/components/mint'

import { useUserRewards } from '../farmCard/userReward'
import Empty from '@/components/empty'

export type MyRewardProps = {
  farmAddress: string
}

export default function MyReward({ farmAddress }: MyRewardProps) {
  const rewards = useUserRewards(farmAddress, 1000)

  return (
    <div className="grid grid-cols-12 gap-4">
      <p className="col-span-full mb-4">My Rewards</p>
      {rewards.map(({ mintAddress, amount }) => (
        <div
          key={mintAddress}
          className="col-span-full grid grid-cols-12 gap-0"
        >
          <div className="col-span-full flex flex-row items-center gap-2">
            <MintLogo
              mintAddress={mintAddress}
              className="w-8 h-8 rounded-full bg-base-300"
            />
            <span className="flex flex-col gap-0 flex-auto">
              <p className="font-bold opacity-60">
                <MintSymbol mintAddress={mintAddress} />
              </p>
              <p className="opacity-60">
                <MintPrice mintAddress={mintAddress} />
              </p>
            </span>
            <span className="flex flex-col gap-0 items-end">
              <p className="font-bold">
                <MintAmount mintAddress={mintAddress} amount={amount} />
              </p>
              <p className="font-bold">
                <MintValue mintAddress={mintAddress} amount={amount} />
              </p>
            </span>
          </div>
        </div>
      ))}
      {!rewards.length && (
        <div className="col-span-full">
          <Empty />
        </div>
      )}
      <button
        className="col-span-full btn btn-primary btn-sm"
        disabled={!rewards.length}
      >
        Harvest
      </button>
    </div>
  )
}
