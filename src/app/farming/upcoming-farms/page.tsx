'use client'
import { useMemo } from 'react'

import LazyLoad from 'react-lazy-load'
import FarmingCard from '../farmCard'

import { useAllFarms } from '@/providers/farming.provider'
import { useSortedFarmsByStartDate } from '@/hooks/farming.hook'

export default function UpcomingFarms() {
  const farms = useAllFarms()

  const upcomingFarms = useMemo(
    () =>
      Object.keys(farms).filter((farmAddress) => {
        const { startDate } = farms[farmAddress]
        return startDate.toNumber() * 1000 > Date.now()
      }),
    [farms],
  )
  const sortedUpcomingFarms = useSortedFarmsByStartDate(upcomingFarms)

  return (
    <div className="grid grid-cols-12 gap-4 @container">
      {sortedUpcomingFarms.map((farmAddress) => (
        <LazyLoad className="col-span-12 @2xl:col-span-6" key={farmAddress}>
          <FarmingCard farmAddress={farmAddress} />
        </LazyLoad>
      ))}
    </div>
  )
}
