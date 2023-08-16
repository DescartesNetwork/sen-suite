import { useState } from 'react'

import RewardCard from './rewardCard'
import RewardCardTable from './rewardCardTable'
import { ChevronDown } from 'lucide-react'
import Empty from '@/components/empty'

import { ReceiveItem } from './page'

const DEFAULT_AMOUNT = 4

const AirdropList = ({ airdrops }: { airdrops: ReceiveItem[] }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  return (
    <div className="card bg-base-100 p-[16px] gap-6">
      <div className="flex">
        <p className="text-[16px]">
          Airdrop receive
          <span className="ml-2">{airdrops.length}</span>
        </p>
      </div>

      {airdrops.length === 0 ? (
        <div>
          <Empty />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="hidden md:table">
            <thead>
              <tr>
                <th>UNLOCK TIME</th>
                <th>EXPIRATION TIME</th>
                <th>SENDER</th>
                <th>TOKEN</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {airdrops.slice(0, showAirdrop).map((props, i) => (
                <RewardCardTable key={i} {...props} />
              ))}
            </tbody>
          </table>
          {airdrops.slice(0, showAirdrop).map((props, i) => (
            <RewardCard key={i} {...props} />
          ))}
        </div>
      )}

      <button
        onClick={() => setAmountAirdrop(showAirdrop + DEFAULT_AMOUNT)}
        disabled={showAirdrop >= airdrops.length}
        className="btn btn-ghost flex self-center"
      >
        <ChevronDown className="h-4 w-4" /> View more
      </button>
    </div>
  )
}

export default AirdropList
