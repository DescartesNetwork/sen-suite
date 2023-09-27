'use client'
import { useState } from 'react'

import { MintLogo, MintSymbol } from '@/components/mint'

import { useLaunchpadByAddress } from '@/providers/launchpad.provider'

type BuyTokenProps = {
  launchpadAddress: string
}
export default function BuyToken({ launchpadAddress }: BuyTokenProps) {
  const [amount, setAmount] = useState(0)

  const { mint, stableMint } = useLaunchpadByAddress(launchpadAddress)
  const mintAddress = mint.toBase58()

  return (
    <div className="card rounded-3xl p-6 bg-base-100 flex flex-col gap-6">
      {/* Ask amount */}
      <div className="flex flex-col gap-2">
        <p className="text-sm">You pay</p>
        <div className="card bg-base-200 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
          <div className="col-span-12 flex flex-row gap-2 items-center">
            <div className="card bg-base-100 px-4 py-1 rounded-full flex flex-row gap-2 items-center cursor-pointer">
              <MintLogo
                mintAddress={stableMint.toBase58()}
                className="w-8 h-8 rounded-full"
              />
              <h5 className="text-sm">
                <MintSymbol mintAddress={stableMint.toBase58()} />
              </h5>
            </div>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input input-ghost bg-base-200 w-full max-w-sm rounded-full focus:outline-none text-right text-xl"
            />
          </div>
          <div className="col-span-12 flex flex-row gap-2 items-start justify-between">
            <div className="flex flex-col">
              <p className="text-xs font-bold opacity-60">Available</p>
              <p>0</p>
            </div>
            <div className="flex-auto max-w-[112px]">
              <input
                type="range"
                min={0}
                max={100}
                step={50}
                value={0}
                className="range range-xs range-primary"
              />
              <div className="w-full flex flex-row justify-between px-1 text-[9px] opacity-60">
                <span>|</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bid amount */}
      <div className="flex flex-col gap-2">
        <p className="text-sm">You receive</p>
        <div className="card rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
          <div className="col-span-12 flex flex-row gap-2 items-center">
            <div className="card p-2 rounded-full flex flex-row gap-2 items-center cursor-pointer">
              <MintLogo
                mintAddress={mintAddress}
                className="w-8 h-8 rounded-full"
              />
              <h5 className="text-sm">
                <MintSymbol mintAddress={mintAddress} />
              </h5>
            </div>
            <div className="flex-auto text-right">0</div>
          </div>
          <div className="col-span-12 flex flex-row gap-2 items-start justify-between">
            <p className="text-sm">Rate</p>
            <div className="flex-auto max-w-[155px]">
              <span>1</span> <MintSymbol mintAddress={mintAddress} />{' '}
              <span>=</span> 0{' '}
              <MintSymbol mintAddress={stableMint.toBase58()} />
            </div>
          </div>
        </div>
      </div>
      <button className="btn btn-primary w-full rounded-full">Purchase</button>
    </div>
  )
}
