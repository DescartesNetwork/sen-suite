import { useState } from 'react'

import { ChevronDown } from 'lucide-react'
import Empty from '@/components/empty'
import RewardCardTable from './rewardCardTable'

import { ReceiveItem } from './page'

const DEFAULT_AMOUNT = 4

const AirdropTable = ({ airdrops }: { airdrops: ReceiveItem[] }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  return (
    <div className="md:flex hidden flex-col gap-6 ">
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
            <RewardCardTable key={i} {...props} />
          ))}
        </tbody>
      </table>
      {!airdrops.length ? (
        <Empty />
      ) : (
        <button
          onClick={() => setAmountAirdrop(showAirdrop + DEFAULT_AMOUNT)}
          disabled={showAirdrop >= airdrops.length}
          className="btn btn-ghost flex self-center"
        >
          <ChevronDown className="h-4 w-4" /> View more
        </button>
      )}
    </div>
  )
}

export default AirdropTable
