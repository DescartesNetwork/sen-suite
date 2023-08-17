import { useState } from 'react'

import { ChevronDown } from 'lucide-react'
import HistoryCard from './historyCard'
import Empty from '@/components/empty'

import {
  useLoadingAirdrop,
  useMyDistributes,
} from '@/providers/airdrop.provider'
import { Distribute } from '@/hooks/airdrop.hook'

const DEFAULT_AMOUNT = 4

const History = ({ type }: { type: Distribute }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)
  const { airdrops, vesting } = useMyDistributes()
  const { loadingAirdrop } = useLoadingAirdrop()
  const history = type === Distribute.Airdrop ? airdrops : vesting

  const widthScreen = window.innerWidth

  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          History
          <span className="ml-2">{history.length}</span>
        </p>
      </div>

      <div className="flex flex-col items-center overflow-x-auto">
        {loadingAirdrop ? (
          <span className="loading loading-bars loading-xs" />
        ) : widthScreen >= 768 ? (
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
              {history.slice(0, showAirdrop).map((address) => (
                <HistoryCard address={address} key={address} />
              ))}
            </tbody>
          </table>
        ) : (
          history
            .slice(0, showAirdrop)
            .map((address) => <HistoryCard address={address} key={address} />)
        )}
      </div>

      {!history.length ? (
        <Empty />
      ) : (
        <button
          onClick={() => setAmountAirdrop(showAirdrop + DEFAULT_AMOUNT)}
          disabled={showAirdrop >= history.length}
          className="btn btn-ghost flex self-center"
        >
          <ChevronDown className="h-4 w-4" /> View more
        </button>
      )}
    </div>
  )
}

export default History
