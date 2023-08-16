import { useState } from 'react'

import { ChevronDown } from 'lucide-react'
import Empty from '@/components/empty'
import RewardCard from './rewardCard'

import { ReceiveItem } from './page'

const DEFAULT_AMOUNT = 4

const AirdropListCard = ({ airdrops }: { airdrops: ReceiveItem[] }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  return (
    <div className="flex md:hidden flex-col gap-6 justify-center ">
      {airdrops.slice(0, showAirdrop).map((props, i) => (
        <RewardCard key={i} {...props} />
      ))}
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

export default AirdropListCard
