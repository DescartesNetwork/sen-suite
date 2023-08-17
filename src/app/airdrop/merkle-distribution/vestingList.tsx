import { Fragment, useState } from 'react'

import RewardCard from './rewardCard'
import { ChevronDown } from 'lucide-react'
import Empty from '@/components/empty'

import { ReceiveItem } from './page'
import { useLoadingDistributor } from '@/providers/airdrop.provider'

const DEFAULT_AMOUNT = 4

const AirdropBody = ({
  amountShow,
  vesting,
}: {
  amountShow: number
  vesting: ReceiveItem[][]
}) => {
  const screenWidth = window.innerWidth

  if (screenWidth < 768)
    return vesting.slice(0, amountShow).map((campaign, i) => (
      <Fragment key={i}>
        {campaign.map((props: ReceiveItem, index) => (
          <RewardCard key={`${props.distributor}-${index}`} {...props} />
        ))}
      </Fragment>
    ))

  return (
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
        {vesting.slice(0, amountShow).map((campaign, i) => (
          <Fragment key={i}>
            {campaign.map((props: ReceiveItem, index) => (
              <RewardCard key={`${props.distributor}-${index}`} {...props} />
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  )
}

const VestingList = ({ vesting }: { vesting: ReceiveItem[][] }) => {
  const [amountShow, setAmountShow] = useState(DEFAULT_AMOUNT)
  const loading = useLoadingDistributor()

  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          Airdrop receive
          <span className="ml-2">{vesting.length}</span>
        </p>
      </div>
      <div className="flex flex-col items-center overflow-x-auto ">
        {loading ? (
          <span className="loading loading-bars loading-xs" />
        ) : (
          <AirdropBody vesting={vesting} amountShow={amountShow} />
        )}
      </div>

      {!vesting.length && !loading && <Empty />}
      <button
        onClick={() => setAmountShow(amountShow + DEFAULT_AMOUNT)}
        disabled={amountShow >= vesting.length}
        className="btn btn-ghost flex self-center"
      >
        <ChevronDown className="h-4 w-4" /> View more
      </button>
    </div>
  )
}

export default VestingList
