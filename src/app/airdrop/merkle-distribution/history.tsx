import { useState } from 'react'

import { ChevronDown } from 'lucide-react'
import HistoryCard from './historyCard'
import Empty from '@/components/empty'

import {
  useLoadingDistributor,
  useMyDistributes,
} from '@/providers/airdrop.provider'
import { Distribute } from '@/hooks/airdrop.hook'

const DEFAULT_AMOUNT = 4

const HistoryBody = ({
  history,
  amountShow,
}: {
  amountShow: number
  history: string[]
}) => {
  const screenWidth = window.innerWidth

  if (screenWidth < 768)
    return (
      <div className="w-full">
        {history.slice(0, amountShow).map((address) => (
          <HistoryCard address={address} key={address} />
        ))}
      </div>
    )

  return (
    <table className="table">
      <thead>
        <tr>
          <th>CREATED AT</th>
          <th>UNLOCK DATE</th>
          <th>TOKEN</th>
          <th>TOTAL</th>
          <th>REMAINING</th>
          <th>ACTION</th>
        </tr>
      </thead>
      <tbody>
        {history.slice(0, amountShow).map((address) => (
          <HistoryCard address={address} key={address} />
        ))}
      </tbody>
    </table>
  )
}

const History = ({ type }: { type: Distribute }) => {
  const [amountShow, setAmountShow] = useState(DEFAULT_AMOUNT)
  const { airdrops, vesting } = useMyDistributes()
  const loading = useLoadingDistributor()

  const history = type === Distribute.Airdrop ? airdrops : vesting

  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          History
          <span className="ml-2">{history.length}</span>
        </p>
      </div>

      <div className="flex flex-col items-center">
        {loading ? (
          <span className="loading loading-bars loading-xs" />
        ) : (
          <HistoryBody history={history} amountShow={amountShow} />
        )}
      </div>

      {!history.length && !loading && <Empty />}
      <button
        onClick={() => setAmountShow(amountShow + DEFAULT_AMOUNT)}
        disabled={amountShow >= history.length}
        className="btn btn-ghost flex self-center"
      >
        <ChevronDown className="h-4 w-4" /> View more
      </button>
    </div>
  )
}

export default History
