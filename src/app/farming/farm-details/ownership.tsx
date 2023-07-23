'use client'
import { shortenAddress } from '@/helpers/utils'

export type OwnershipProps = {
  farmAddress: string
}

export default function Ownership({ farmAddress }: OwnershipProps) {
  return (
    <div className="grid grid-cols-12 gap-2">
      <p className="col-span-full">Ownership</p>
      <p className="col-span-full">{shortenAddress(farmAddress)}</p>
    </div>
  )
}
