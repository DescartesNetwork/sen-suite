'use client'
import { Fragment, useState } from 'react'

import { ChevronDown } from 'lucide-react'
import RewardCard from './rewardCard'

import { ReceiveItem } from './page'

const DEFAULT_AMOUNT = 4

type VestingListProps = {
  vesting: ReceiveItem[][]
  loading: boolean
}

const VestingList = ({ vesting, loading }: VestingListProps) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          Vesting receive
          <span className="ml-2">{vesting.length}</span>
        </p>
      </div>
      {loading && !vesting.length && (
        <div className="w-full text-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      )}
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
            {vesting.slice(0, showAirdrop).map((campaign, i) => (
              <Fragment key={i}>
                {campaign.map((props: ReceiveItem, index) => (
                  <RewardCard
                    key={`${props.distributor}-${index}`}
                    {...props}
                  />
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => setAmountAirdrop(showAirdrop + DEFAULT_AMOUNT)}
        disabled={showAirdrop >= vesting.length}
        className="btn btn-ghost flex self-center"
      >
        <ChevronDown className="h-4 w-4" /> View more
      </button>
    </div>
  )
}

export default VestingList
