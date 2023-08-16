import { Fragment, useState } from 'react'

import { ChevronDown } from 'lucide-react'
import RewardCard from './rewardCard'
import RewardCardTable from './rewardCardTable'
import Empty from '@/components/empty'

import { ReceiveItem } from './page'

const DEFAULT_AMOUNT = 4

const VestingList = ({ vesting }: { vesting: ReceiveItem[][] }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  return (
    <div className="card bg-base-100 p-[16px] gap-6">
      <div className="flex">
        <p className="text-[16px]">
          Vesting receive
          <span className="ml-2">{vesting.length}</span>
        </p>
      </div>

      {vesting.length === 0 ? (
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
              {vesting.slice(0, showAirdrop).map((campaign, i) => (
                <Fragment key={i}>
                  {campaign.map((props: ReceiveItem, index) => (
                    <RewardCardTable
                      key={`${props.distributor}-${index}`}
                      {...props}
                    />
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
          {vesting.slice(0, showAirdrop).map((campaign, i) => (
            <Fragment key={i}>
              {campaign.map((props: ReceiveItem, index) => (
                <RewardCard key={`${props.distributor}-${index}`} {...props} />
              ))}
            </Fragment>
          ))}
        </div>
      )}

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
