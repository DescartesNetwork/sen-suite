import { useState } from 'react'

import RewardCard from './rewardCard'
import { ChevronDown } from 'lucide-react'

import { ReceiveItem } from './page'

const DEFAULT_AMOUNT = 4

const AirdropList = ({ airdrops }: { airdrops: ReceiveItem[] }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          Airdrop receive
          <span className="ml-2">{airdrops.length}</span>
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
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
              <RewardCard key={i} {...props} />
            ))}
          </tbody>
        </table>
      </div>
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
