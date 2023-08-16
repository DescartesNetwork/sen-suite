import Empty from '@/components/empty'
import VestingTable from './vestingTable'
import VestingListCard from './vestingListCard'

import { ReceiveItem } from './page'

const VestingList = ({ vesting }: { vesting: ReceiveItem[][] }) => {
  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          Vesting receive
          <span className="ml-2">{vesting.length}</span>
        </p>
      </div>
      {!vesting.length ? (
        <div>
          <Empty />
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* UI desktop */}
          <VestingTable vesting={vesting} />
          {/* UI Mobile */}
          <VestingListCard vesting={vesting} />
        </div>
      )}
    </div>
  )
}

export default VestingList
