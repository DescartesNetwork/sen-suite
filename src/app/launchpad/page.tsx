'use client'
import { useRouter } from 'next/navigation'

import { Backpack } from 'lucide-react'
import Banner from './banner'
import ListLaunchpad from './listLaunchpad'

import { LaunchpadSate } from '@/hooks/launchpad.hook'

export default function Launchpad() {
  const { push } = useRouter()

  return (
    <div className="w-full grid grid-cols-12 gap-12">
      <div className="col-span-full">
        <Banner />
      </div>
      <div className="col-span-full flex justify-end">
        <div
          onClick={() =>
            push(`/launchpad/all-launchpad?state=${LaunchpadSate.yourPurchase}`)
          }
          className="tooltip cursor-pointer"
          data-tip="View your purchase"
        >
          <Backpack
            className="p-2 border border-base-100 rounded-full"
            size={44}
          />
        </div>
      </div>
      <div className="col-span-full">
        <ListLaunchpad state={LaunchpadSate.active} />
      </div>
      <div className="col-span-full">
        <ListLaunchpad state={LaunchpadSate.upcoming} />
      </div>
      <div className="col-span-full">
        <ListLaunchpad state={LaunchpadSate.completed} />
      </div>
    </div>
  )
}
