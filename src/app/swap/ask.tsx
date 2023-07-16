'use client'
import { useCallback, useState } from 'react'

import TokenSelection from '@/components/tokenSelection'
import { TokenLogo, TokenSymbol } from '@/components/token'
import { ChevronDown } from 'lucide-react'

import { useSwapStore } from '@/hooks/swap.hook'

export default function Ask() {
  const [open, setOpen] = useState(false)
  const askTokenAddress = useSwapStore(({ askTokenAddress }) => askTokenAddress)
  const setAskTokenAddress = useSwapStore(
    ({ setAskTokenAddress }) => setAskTokenAddress,
  )
  const askAmount = useSwapStore(({ askAmount }) => askAmount)

  const onAskTokenAddress = useCallback(
    (tokenAddress: string) => {
      if (askTokenAddress !== tokenAddress) {
        setAskTokenAddress(tokenAddress)
        setOpen(false)
      }
    },
    [askTokenAddress, setAskTokenAddress, setOpen],
  )

  return (
    <div className="card bg-base-200 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12 flex flex-row gap-2 items-center">
        <div
          className="card bg-base-100 p-2 rounded-full flex flex-row gap-2 items-center cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <TokenLogo
            tokenAddress={askTokenAddress}
            className="w-8 h-8 rounded-full"
          />
          <h5 className="text-sm">
            <TokenSymbol tokenAddress={askTokenAddress} />
          </h5>
          <ChevronDown className="h-4 w-4" />
        </div>
        <input
          type="number"
          placeholder="0"
          className="input input-ghost w-full max-w-sm rounded-full focus:outline-none text-right text-xl"
          value={askAmount}
          readOnly
        />
      </div>
      <TokenSelection
        open={open}
        onCancel={() => setOpen(false)}
        tokenAddress={askTokenAddress}
        onChange={onAskTokenAddress}
      />
    </div>
  )
}
