'use client'
import { shortenAddress } from '@/helpers/utils'

export type UnstakeProps = {
  farmAddress: string
}

export default function Unstake({ farmAddress }: UnstakeProps) {
  return (
    <div className="grid grid-cols-12 gap-2">
      <p className="col-span-full">Unstake</p>
      <p className="col-span-full">{shortenAddress(farmAddress)}</p>
    </div>
  )
}
