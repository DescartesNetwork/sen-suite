'use client'
import { useWallet } from '@solana/wallet-adapter-react'

import LazyLoad from 'react-lazy-load'
import FarmCard from '../farmCard'

import { useAllDebts, useAllFarms } from '@/providers/farming.provider'
import { useMemo } from 'react'
import { useSortedFarmsByStartDate } from '@/hooks/farming.hook'

export default function MyFarms() {
  const { publicKey } = useWallet()
  const farms = useAllFarms()
  const debts = useAllDebts()

  const stakedFarms = useMemo(
    () => Object.values(debts).map(({ farm }) => farm.toBase58()),
    [debts],
  )
  const sortedStakedFarms = useSortedFarmsByStartDate(stakedFarms)
  const createdFarms = Object.keys(farms).filter(
    (farmAddress) =>
      publicKey && farms[farmAddress].authority.equals(publicKey),
  )
  const sortedCreatedFarms = useSortedFarmsByStartDate(createdFarms)

  return (
    <div className="grid grid-cols-12 gap-4 @container">
      <div className="col-span-full px-4 py-2 flex flex-row items-center gap-2">
        <h5 className="opacity-60">Created Farms</h5>
        <div className="divider divider-horizontal m-0" />
        <p className="font-bold">{sortedCreatedFarms.length} Farms</p>
      </div>
      {sortedCreatedFarms.map((farmAddress) => (
        <LazyLoad className="col-span-full @2xl:col-span-6" key={farmAddress}>
          <FarmCard farmAddress={farmAddress} />
        </LazyLoad>
      ))}
      <div className="col-span-full px-4 py-2 flex flex-row items-center gap-2">
        <h5 className="opacity-60">Staked Farms</h5>
        <div className="divider divider-horizontal m-0" />
        <p className="font-bold">{sortedStakedFarms.length} Farms</p>
      </div>
      {sortedStakedFarms.map((farmAddress) => (
        <LazyLoad className="col-span-full @2xl:col-span-6" key={farmAddress}>
          <FarmCard farmAddress={farmAddress} />
        </LazyLoad>
      ))}
    </div>
  )
}
