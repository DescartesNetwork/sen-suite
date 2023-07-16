'use client'

import { ArrowUpDown, Settings } from 'lucide-react'
import Ask from './ask'
import Bid from './bid'

import { useSwitch } from '@/hooks/swap.hook'

export default function Swap() {
  const onSwitch = useSwitch()

  return (
    <div className="h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4">
      <div className="flex flex-row w-full justify-center">
        <div className="max-w-[360px]">
          <div className="grid grid-cols-12 gap-2 card rounded-3xl bg-base-100 shadow-xl p-4">
            <div className="col-span-12 flex flex-row gap-2 items-center pb-2">
              <h5 className="flex-auto">Swap</h5>
              <button className="btn btn-sm btn-ghost btn-circle">
                <Settings className="h-5 w-5" />
              </button>
            </div>
            <div className="col-span-12">
              <Bid />
            </div>
            <div className="col-span-12 flex flex-row justify-center -my-4">
              <button
                className="btn btn-sm btn-square btn-primary z-10"
                onClick={onSwitch}
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
            <div className="col-span-12">
              <Ask />
            </div>
            <div className="col-span-12">
              <div className="flex">
                <div className="flex-auto">
                  <p className="font-bold">Key</p>
                </div>
                <div>
                  <p>Value</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
