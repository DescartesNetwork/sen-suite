'use client'

import FarmingPanel from './panel'

export default function Farming() {
  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-full">
        <FarmingPanel />
      </div>
    </div>
  )
}
