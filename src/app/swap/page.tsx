'use client'
import { useCallback, useState } from 'react'

import { ArrowUpDown } from 'lucide-react'
import Ask from './ask'
import Bid from './bid'
import SwapSettings from './swapSettings'
import SwapInfo from './swapInfo'

import { useSwap, useSwitch } from '@/hooks/swap.hook'

export default function Swap() {
  const [loading, setLoading] = useState(false)
  const onSwitch = useSwitch()
  const { routes, swap, fetching } = useSwap()

  const onSwap = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await swap()
      console.log(txId)
    } catch (er: any) {
      console.log(er.message)
    } finally {
      setLoading(false)
    }
  }, [swap])

  return (
    <div className="flex h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 items-center">
      <div className="flex flex-row w-full justify-center">
        <div className="max-w-[360px]">
          <div className="grid grid-cols-12 gap-2 card rounded-3xl bg-base-100 shadow-xl p-4">
            <div className="col-span-12 flex flex-row gap-2 items-center pb-2">
              <h5 className="flex-auto">Swap</h5>
              <SwapSettings />
            </div>
            <div className="col-span-12">
              <Bid />
            </div>
            <div className="col-span-12 flex flex-row justify-center -my-4 z-[1]">
              <button
                className="btn btn-sm btn-square bg-base-100 shadow-md"
                onClick={onSwitch}
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
            <div className="col-span-12">
              <Ask />
            </div>
            <div className="col-span-12">
              <SwapInfo />
            </div>
            <div className="col-span-12">
              <button
                className="btn btn-primary w-full rounded-full"
                disabled={loading || fetching || !routes.length}
                onClick={onSwap}
              >
                Swap
                {loading ||
                  (fetching && <span className="loading loading-spinner" />)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
