'use client'
import { useMemo } from 'react'

import { Trash, UserPlus } from 'lucide-react'

export type EditRowBulkSenderProps = {
  amount?: string
  onAmount?: (amount: string) => void
  address?: string
  onAddress?: (address: string) => void
  onClick?: () => void
  toAdd?: boolean
}

export default function EditRowBulkSender({
  amount = '',
  onAmount = () => {},
  address = '',
  onAddress = () => {},
  onClick = () => {},
  toAdd = false,
}: EditRowBulkSenderProps) {
  const Icon = useMemo(() => (toAdd ? UserPlus : Trash), [toAdd])
  return (
    <div className="relative flex flex-row items-center">
      <div className="grid grid-cols-12 join">
        <input
          type="text"
          placeholder="Receiver address"
          className="col-span-8 join-item input input-sm rounded-full bg-base-200 focus:outline-0"
          value={address}
          onChange={(e) => onAddress(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          className="col-span-4 join-item input input-sm rounded-full bg-base-200 focus:outline-0 pr-7"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
        />
      </div>
      <button
        className={
          'btn btn-xs btn-circle absolute right-1' +
          (toAdd ? ' btn-primary' : '')
        }
        onClick={onClick}
      >
        <Icon className="w-3 h-3" />
      </button>
    </div>
  )
}
