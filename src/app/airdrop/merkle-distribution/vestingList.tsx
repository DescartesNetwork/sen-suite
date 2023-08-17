import { Fragment, useState } from 'react'

import { ChevronDown } from 'lucide-react'
import RewardCard from './rewardCard'
import Empty from '@/components/empty'

import { ReceiveItem } from './page'
import { useDistributors } from '@/providers/airdrop.provider'

const DEFAULT_AMOUNT = 4

const VestingList = ({ vesting }: { vesting: ReceiveItem[][] }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)
  const { loadingAirdrop } = useDistributors()
  const widthScreen = window.innerWidth

  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          Vesting receive
          <span className="ml-2">{vesting.length}</span>
        </p>
      </div>
      <div className="overflow-x-auto">
        {widthScreen >= 768 ? (
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
              {loadingAirdrop ? (
                <span className="loading loading-bars loading-xs" />
              ) : (
                vesting.slice(0, showAirdrop).map((campaign, i) => (
                  <Fragment key={i}>
                    {campaign.map((props: ReceiveItem, index) => (
                      <RewardCard
                        key={`${props.distributor}-${index}`}
                        {...props}
                      />
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        ) : loadingAirdrop ? (
          <span className="loading loading-bars loading-xs" />
        ) : (
          vesting.slice(0, showAirdrop).map((campaign, i) => (
            <Fragment key={i}>
              {campaign.map((props: ReceiveItem, index) => (
                <RewardCard key={`${props.distributor}-${index}`} {...props} />
              ))}
            </Fragment>
          ))
        )}
      </div>

      {!vesting.length ? (
        <Empty />
      ) : (
        <button
          onClick={() => setAmountAirdrop(showAirdrop + DEFAULT_AMOUNT)}
          disabled={showAirdrop >= vesting.length}
          className="btn btn-ghost flex self-center"
        >
          <ChevronDown className="h-4 w-4" /> View more
        </button>
      )}
    </div>
  )
}

export default VestingList
