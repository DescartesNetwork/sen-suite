'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { ChevronLeft } from 'lucide-react'
import MintSelect from './mintSelect'
import AddReward from './addReward'
import AddTime from './addTime'
import BoostNFT from './boostNFT'

import { Reward } from '@/hooks/farming.hook'

export const EMPTY_REWARD = {
  mintAddress: '',
  budget: '',
}

const NewFarm = () => {
  const [mintFarm, setMintFarm] = useState('')
  const [tokenRewards, setTokenRewards] = useState<Reward[]>([EMPTY_REWARD])
  // const [boostsData, setBoostsData] = useState<BoostData[]>([])
  const [time, setTime] = useState({ startAt: Date.now(), endAt: 0 })
  const { back } = useRouter()

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-full flex items-center justify-between">
        <button onClick={back} className="btn btn-circle btn-sm">
          <ChevronLeft />
        </button>
        <h5>New Farm</h5>
      </div>
      <div className="col-span-full mt-2">
        <MintSelect mintAddress={mintFarm} onMintAddress={setMintFarm} />
      </div>
      <div className="col-span-full">
        <AddReward rewards={tokenRewards} onRewards={setTokenRewards} />
      </div>
      <div className="col-span-full">
        <AddTime time={time} onTime={setTime} />
      </div>
      <div className="col-span-full">
        <BoostNFT />
      </div>
    </div>
  )
}

export default NewFarm
