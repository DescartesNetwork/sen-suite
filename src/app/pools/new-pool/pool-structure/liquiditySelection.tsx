'use client'
import { useState } from 'react'
import clsx from 'clsx'

import { AlertCircle, ChevronDown, Percent, Trash } from 'lucide-react'
import { MintLogo, MintSymbol } from '@/components/mint'
import TokenSelection from '@/components/tokenSelection'

export type LiquiditySelectionProps = {
  mintAddress: string
  onMintAddress?: (mintAddress: string) => void
  weight: number
  onWeight?: (weight: number) => void
  onDelete?: () => void
}

export default function LiquiditySelection({
  mintAddress,
  onMintAddress = () => {},
  weight,
  onWeight = () => {},
  onDelete = () => {},
}: LiquiditySelectionProps) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="w-full flex flex-row gap-2 items-center">
      <div
        onClick={() => setOpen(true)}
        className="flex flex-row gap-2 items-center cursor-pointer"
      >
        <MintLogo mintAddress={mintAddress} className="w-8 h-8 rounded-full" />
        <p className="font-bold flex flex-row gap-1 items-center">
          <MintSymbol mintAddress={mintAddress} defaultValue="Select" />
          <ChevronDown className="w-4 h-4" />
        </p>
      </div>
      <TokenSelection
        open={open}
        onCancel={() => setOpen(false)}
        mintAddress={mintAddress}
        onChange={onMintAddress}
      />
      <div className="flex-auto flex flex-row items-center relative">
        <input
          value={weight || ''}
          type="number"
          placeholder="0"
          min={10}
          max={100}
          className="flex-auto input input-ghost rounded-full text-right text-xl border-none focus:outline-none pr-7"
          onChange={(e) => onWeight(Number(e.target.value))}
        />
        <Percent className="h-3 w-3 opacity-60 absolute right-3" />
      </div>
      <div className="dropdown dropdown-left">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle btn-sm"
          onClick={() => setConfirm(true)}
        >
          <Trash className="w-4 h-4" />
        </div>
        <div
          tabIndex={0}
          className={clsx(
            'dropdown-content z-[1] card w-[256px] bg-base-100 border-2 border-base-300 shadow-xl p-4 grid grid-cols-12 gap-2',
            {
              hidden: !confirm,
            },
          )}
        >
          <span className="col-span-full flex flex-row gap-2 items-center">
            <AlertCircle className="h-4 w-4" />
            <p>Are you sure to delete it?</p>
          </span>
          <button
            className="col-span-6 btn btn-sm"
            onClick={() => setConfirm(false)}
          >
            Cancel
          </button>
          <button
            className="col-span-6 btn btn-sm btn-error"
            onClick={() => {
              onDelete()
              setConfirm(false)
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
