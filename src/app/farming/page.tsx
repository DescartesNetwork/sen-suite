'use client'
import { useMemo } from 'react'

import LazyLoad from 'react-lazy-load'
import FarmingCard from './farmCard'

import { useAllFarms } from '@/providers/farming.provider'
import { useSortedFarms } from '@/hooks/farming.hook'

export default function Farming() {
  const farms = useAllFarms()

  const farmAddresses = useMemo(() => Object.keys(farms), [farms])
  const sortedFarmAddresses = useSortedFarms(farmAddresses)

  return (
    <div className="grid grid-cols-12 gap-4 @container">
      {sortedFarmAddresses.map((farmAddress) => (
        <LazyLoad className="col-span-12 @2xl:col-span-6" key={farmAddress}>
          <FarmingCard farmAddress={farmAddress} />
        </LazyLoad>
      ))}
    </div>
  )
}
