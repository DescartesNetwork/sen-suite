import { Fragment, useState } from 'react'

import { ChevronDown } from 'lucide-react'
import Empty from '@/components/empty'
import RewardCard from './rewardCard'

import { ReceiveItem } from './page'

const DEFAULT_AMOUNT = 4

const VestingListCard = ({ vesting }: { vesting: ReceiveItem[][] }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  return (
    <div className="flex md:hidden flex-col justify-center gap-6">
      {vesting.slice(0, showAirdrop).map((campaign, i) => (
        <Fragment key={i}>
          {campaign.map((props: ReceiveItem, index) => (
            <RewardCard key={`${props.distributor}-${index}`} {...props} />
          ))}
        </Fragment>
      ))}
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

export default VestingListCard
