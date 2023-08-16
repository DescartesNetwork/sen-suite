import AirdropTable from './airdropTable'

import AirdropListCard from './airdropListCard'
import Empty from '@/components/empty'

import { ReceiveItem } from './page'

const AirdropList = ({ airdrops }: { airdrops: ReceiveItem[] }) => {
  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          Airdrop receive
          <span className="ml-2">{airdrops.length}</span>
        </p>
      </div>

      {!airdrops.length ? (
        <Empty />
      ) : (
        <div className="overflow-x-auto">
          {/* UI desktop */}
          <AirdropTable airdrops={airdrops} />
          {/* UI Mobile */}
          <AirdropListCard airdrops={airdrops} />
        </div>
      )}
    </div>
  )
}

export default AirdropList
