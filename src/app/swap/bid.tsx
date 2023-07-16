'use client'
import { ChangeEvent, useCallback, useState } from 'react'

import TokenSelection from '@/components/tokenSelection'

import { useSwapStore } from '@/hooks/swap.hook'
import { MyTokenBalance, TokenLogo, TokenSymbol } from '@/components/token'
import { ChevronDown } from 'lucide-react'

export default function Bid() {
  const [open, setOpen] = useState(false)
  const bidTokenAddress = useSwapStore(({ bidTokenAddress }) => bidTokenAddress)
  const setBidTokenAddress = useSwapStore(
    ({ setBidTokenAddress }) => setBidTokenAddress,
  )

  const onBidTokenAddress = useCallback(
    (tokenAddress: string) => {
      if (bidTokenAddress !== tokenAddress) {
        setBidTokenAddress(tokenAddress)
        setOpen(false)
      }
    },
    [bidTokenAddress, setBidTokenAddress, setOpen],
  )

  const onRange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const percentage = Number(e.target.value) / 100
      console.log(percentage, bidTokenAddress)
    },
    [bidTokenAddress],
  )

  return (
    <div className="card bg-base-200 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12 flex flex-row gap-2 items-center">
        <div
          className="card bg-base-100 p-2 rounded-full flex flex-row gap-2 items-center cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <TokenLogo
            tokenAddress={bidTokenAddress}
            className="w-8 h-8 rounded-full"
          />
          <h5 className="text-sm">
            <TokenSymbol tokenAddress={bidTokenAddress} />
          </h5>
          <ChevronDown className="h-4 w-4" />
        </div>
        <input
          type="number"
          placeholder="0"
          className="input input-ghost w-full max-w-sm rounded-full focus:outline-none text-right text-xl"
        />
      </div>
      <div className="col-span-12 flex flex-row gap-2 items-start justify-between">
        <div className="flex flex-col">
          <p className="text-xs font-bold opacity-60">Available</p>
          <p>
            <MyTokenBalance tokenAddress={bidTokenAddress} />
          </p>
        </div>
        <div className="flex-auto max-w-[100px]">
          <input
            type="range"
            min={0}
            max={100}
            step={50}
            defaultValue={0}
            className="range range-xs range-primary"
            onChange={onRange}
          />
          <div className="w-full flex flex-row justify-between px-1 text-[9px] opacity-60">
            <span>|</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      <TokenSelection
        open={open}
        onCancel={() => setOpen(false)}
        tokenAddress={bidTokenAddress}
        onChange={onBidTokenAddress}
      />
    </div>
  )
}
