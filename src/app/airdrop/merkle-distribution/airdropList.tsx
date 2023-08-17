import { useState } from 'react'

import RewardCard from './rewardCard'
import { ChevronDown } from 'lucide-react'
import Empty from '@/components/empty'

import { ReceiveItem } from './page'
import { useLoadingDistributor } from '@/providers/airdrop.provider'

const DEFAULT_AMOUNT = 4

const AirdropBody = ({
  amountShow,
  airdrops,
}: {
  amountShow: number
  airdrops: ReceiveItem[]
}) => {
  const screenWidth = window.innerWidth

  if (screenWidth < 768)
    return (
      <div className="grid grid-cols-12">
        {airdrops.slice(0, amountShow).map((props: ReceiveItem) => (
          <div key={props.distributor} className="col-span-full">
            <RewardCard {...props} />
          </div>
        ))}
      </div>
    )

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
        {airdrops.slice(0, amountShow).map((props, i) => (
          <RewardCard key={i} {...props} />
        ))}
      </tbody>
    </table>
  )
}

const AirdropList = ({ airdrops }: { airdrops: ReceiveItem[] }) => {
  const [amountShow, setAmountShow] = useState(DEFAULT_AMOUNT)
  const loading = useLoadingDistributor()

  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          Airdrop receive
          <span className="ml-2">{airdrops.length}</span>
        </p>
      </div>
      {loading ? (
        <span className="loading loading-bars loading-xs" />
      ) : (
        <AirdropBody airdrops={airdrops} amountShow={amountShow} />
      )}

      {!airdrops.length && !loading && <Empty />}
      <button
        onClick={() => setAmountShow(amountShow + DEFAULT_AMOUNT)}
        disabled={amountShow >= airdrops.length}
        className="btn btn-ghost flex self-center"
      >
        <ChevronDown className="h-4 w-4" /> View more
      </button>
    </div>
  )
}

export default AirdropList
