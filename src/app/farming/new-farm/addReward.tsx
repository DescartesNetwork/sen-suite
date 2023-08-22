import { useState } from 'react'

import { MintLogo, MintSymbol } from '@/components/mint'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import TokenSelection from '@/components/tokenSelection'

import { Reward } from '@/hooks/farming.hook'
import { EMPTY_REWARD } from './page'

type RewardCardProps = {
  reward: Reward
  index: number
  onDelete: (index: number) => void
  onChange: (index: number, name: keyof Reward, value: string) => void
}
const RewardCard = ({ reward, index, onChange, onDelete }: RewardCardProps) => {
  const [open, setOpen] = useState(false)

  const onMintChange = (index: number, mintAddress: string) => {
    onChange(index, 'mintAddress', mintAddress)
    setOpen(false)
  }

  return (
    <div className=" grid grid-cols-12 gap-4">
      <div className="col-span-full flex items-center">
        <p className="text-sm flex-auto">Token #{index + 1}</p>
        {!!index && (
          <button
            onClick={() => onDelete(index)}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div
        onClick={() => setOpen(true)}
        className="col-span-6 card rounded-xl bg-base-200 px-3 py-2 flex-row gap-2 items-center cursor-pointer"
      >
        <MintLogo
          className="w-6 h-6 rounded-full"
          mintAddress={reward.mintAddress}
        />
        <p className="font-bold">
          {reward.mintAddress ? (
            <MintSymbol mintAddress={reward.mintAddress} />
          ) : (
            'Select a token'
          )}
        </p>
        <ChevronDown size={16} />
      </div>
      <input
        type="number"
        value={reward.budget}
        onChange={(e) => onChange(index, 'budget', e.target.value)}
        className=" col-span-6 rounded-xl bg-base-200 px-3 py-2"
        placeholder="Enter budget"
      />
      <TokenSelection
        open={open}
        mintAddress={reward.mintAddress}
        onChange={(val) => onMintChange(index, val)}
        onCancel={() => setOpen(false)}
      />
    </div>
  )
}

type AddRewardProps = {
  rewards: Reward[]
  onRewards: (rewards: Reward[]) => void
}
const AddReward = ({ rewards, onRewards }: AddRewardProps) => {
  const onAddReward = () => {
    const nextReward = [...rewards]
    nextReward.push(EMPTY_REWARD)
    return onRewards(nextReward)
  }

  const onDelete = (index: number) => {
    const nextReward = [...rewards]
    nextReward.splice(index, 1)
    return onRewards(nextReward)
  }

  const onChange = (index: number, name: keyof Reward, value: string) => {
    const nextReward = [...rewards]
    nextReward[index] = { ...nextReward[index], [name]: value }
    return onRewards(nextReward)
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full">
        <p className="font-bold">Rewards</p>
      </div>
      {rewards.map((reward, index) => (
        <div key={reward.mintAddress + index} className="col-span-full">
          <RewardCard
            index={index}
            onChange={onChange}
            onDelete={onDelete}
            reward={reward}
          />
        </div>
      ))}
      <div className="col-span-full">
        <button onClick={onAddReward} className="btn btn-block">
          <Plus size={16} /> Add more
        </button>
      </div>
    </div>
  )
}

export default AddReward
