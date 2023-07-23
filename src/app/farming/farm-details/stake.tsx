'use client'
import { shortenAddress } from '@/helpers/utils'

export type StakeProps = {
  farmAddress: string
}

export default function Stake({ farmAddress }: StakeProps) {
  return (
    <div className="grid grid-cols-12 gap-2">
      <p className="col-span-full">Stake</p>
      <p className="col-span-full">{shortenAddress(farmAddress)}</p>
    </div>
  )
}
