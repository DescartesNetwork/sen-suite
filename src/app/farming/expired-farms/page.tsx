'use client'
import { useMemo } from 'react'

import LazyLoad from 'react-lazy-load'
import FarmingCard from '../farmCard'

import { useAllFarms } from '@/providers/farming.provider'
import { useSortedFarms } from '@/hooks/farming.hook'

export default function ExpiredFarms() {
  const farms = useAllFarms()

  const expiredFarms = useMemo(
    () =>
      Object.keys(farms).filter((farmAddress) => {
        const { endDate } = farms[farmAddress]
        return endDate.toNumber() * 1000 < Date.now()
      }),
    [farms],
  )
  const sortedExpiredFarms = useSortedFarms(expiredFarms)

  return (
    <div className="grid grid-cols-12 gap-4 @container">
      {sortedExpiredFarms.map((farmAddress) => (
        <LazyLoad className="col-span-12 @2xl:col-span-6" key={farmAddress}>
          <FarmingCard farmAddress={farmAddress} />
        </LazyLoad>
      ))}
    </div>
  )
}
