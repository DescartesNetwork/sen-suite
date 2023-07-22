'use client'
import { useWallet } from '@solana/wallet-adapter-react'

import FarmingCard from '../card'

import { useAllDebts, useAllFarms } from '@/providers/farming.provider'

export default function MyFarms() {
  const { publicKey } = useWallet()
  const farms = useAllFarms()
  const debts = useAllDebts()

  const jointFarms = Object.values(debts).map(({ farm }) => farm.toBase58())
  const myFarms = Object.keys(farms).filter(
    (farmAddress) =>
      publicKey && farms[farmAddress].authority.equals(publicKey),
  )

  return (
    <div className="grid grid-cols-12 gap-4 @container">
      <h5 className="col-span-12 opacity-60">Created Farms</h5>
      {myFarms.map((farmAddress) => (
        <div className="col-span-12 @2xl:col-span-6" key={farmAddress}>
          <FarmingCard farmAddress={farmAddress} />
        </div>
      ))}
      <h5 className="col-span-12 opacity-60">Staked Farms</h5>
      <div className="col-span-12">
        {jointFarms.map((farmAddress) => (
          <p key={farmAddress} className="">
            {farmAddress}
          </p>
        ))}
      </div>
    </div>
  )
}
