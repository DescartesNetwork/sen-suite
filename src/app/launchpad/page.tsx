'use client'

import Banner from './banner'
import ListLaunchpad from './listLaunchpad'

import { LaunchpadSate } from '@/hooks/launchpad.hook'

export default function Launchpad() {
  return (
    <div className="w-full grid grid-cols-12 gap-12">
      <div className="col-span-full">
        <Banner />
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
