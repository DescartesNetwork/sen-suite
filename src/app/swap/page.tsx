'use client'
import { useState } from 'react'

import TokenSelection from '@/components/tokenSelection'

export default function Swap() {
  const [open, setOpen] = useState(true)

  return (
    <div className="h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4">
      <div className="flex flex-row w-full justify-center">
        <div className="max-w-[360px]">
          <div className="grid grid-cols-12 gap-2 card bg-base-100 shadow-xl p-4">
            <div className="col-span-12">
              <div className="card bg-base-200 p-4 rounded-lg">
                <button
                  className="btn btn-primary"
                  onClick={() => setOpen(true)}
                >
                  Open
                </button>
              </div>
            </div>
            <div className="col-span-12">
              <div className="card bg-base-200 p-4 rounded-lg">
                <button
                  className="btn btn-secondary"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
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
            <TokenSelection open={open} onCancel={() => setOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  )
}
