'use client'

import Bid from './bid'

export default function Swap() {
  return (
    <div className="h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4">
      <div className="flex flex-row w-full justify-center">
        <div className="max-w-[360px]">
          <div className="grid grid-cols-12 gap-2 card rounded-3xl bg-base-100 shadow-xl p-4">
            <div className="col-span-12">
              <Bid />
            </div>
            <div className="col-span-12">{/* Ask */}</div>
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
