import Empty from '@/components/empty'
import HistoryListCard from './historyListCard'

import HistoryTable from './historyTable'
import { useMyDistributes } from '@/providers/airdrop.provider'
import { Distribute } from '@/hooks/airdrop.hook'

const History = ({ type }: { type: Distribute }) => {
  const { airdrops, vesting } = useMyDistributes()
  const history = type === Distribute.Airdrop ? airdrops : vesting
  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          History
          <span className="ml-2">{history.length}</span>
        </p>
      </div>

      {!history.length ? (
        <Empty />
      ) : (
        <div className="overflow-x-auto">
          {/* UI desktop */}
          <HistoryTable history={history} />
          {/* UI mobile */}
          <HistoryListCard history={history} />
        </div>
      )}
    </div>
  )
}

export default History
