'use client'
import { useMemo } from 'react'

import FarmingCard from './farmCard'

import { useAllFarms } from '@/providers/farming.provider'

export default function Farming() {
  const farms = useAllFarms()

  const sortedFarmAddresses = useMemo(
    () =>
      Object.keys(farms).sort((a, b) => {
        const { startDate: ad } = farms[a]
        const { startDate: bd } = farms[b]
        if (ad.eq(bd)) return 0
        else if (ad.lt(bd)) return 1
        else return -1
      }),
    [farms],
  )

  return (
    <div className="grid grid-cols-12 gap-4 @container">
      {sortedFarmAddresses.map((farmAddress) => (
        <div className="col-span-12 @2xl:col-span-6" key={farmAddress}>
          <FarmingCard farmAddress={farmAddress} />
        </div>
      ))}
    </div>
  )
}
