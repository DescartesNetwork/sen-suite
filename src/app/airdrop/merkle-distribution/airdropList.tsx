import { useState } from 'react'

import RewardCard from './rewardCard'
import { ChevronDown } from 'lucide-react'
import Empty from '@/components/empty'

import { ReceiveItem } from './page'
import { useLoadingAirdrop } from '@/providers/airdrop.provider'

const DEFAULT_AMOUNT = 4

const AirdropList = ({ airdrops }: { airdrops: ReceiveItem[] }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)
  const { loadingAirdrop } = useLoadingAirdrop()
  const widthScreen = window.innerWidth

  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          Airdrop receive
          <span className="ml-2">{airdrops.length}</span>
        </p>
      </div>
      <div className="flex flex-col items-center overflow-x-auto ">
        {loadingAirdrop ? (
          <span className="loading loading-bars loading-xs" />
        ) : widthScreen >= 768 ? (
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
        ) : (
          airdrops
            .slice(0, showAirdrop)
            .map((props, i) => <RewardCard key={i} {...props} />)
        )}
      </div>

      {!airdrops.length && !loadingAirdrop ? (
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

export default AirdropList
