'use client'
import ProjectProfile from './projectProfile'
import LaunchpadTimeLine from './launchpadTimeLine'
import CompletedCard from './completedCard'

import { useLaunchpadMetadata } from '@/hooks/launchpad.hook'

type LaunchpadCardProps = {
  launchpadAddress: string
  completed?: boolean
}
export default function LaunchpadCard({
  launchpadAddress,
  completed = false,
}: LaunchpadCardProps) {
  const projectProfile = useLaunchpadMetadata(launchpadAddress)

  if (completed) return <CompletedCard launchpadAddress={launchpadAddress} />
  return (
    <div className="grid grid-cols-12 border cursor-pointer rounded-3xl hover:border-[#63E0B3]">
      <img
        src={projectProfile?.coverPhoto}
        alt="launchpad-img"
        className="w-full col-span-full aspect-video rounded-t-3xl object-cover"
        width={100}
      />
      <div className="col-span-full rounded-3xl card bg-base-100 p-6 grid grid-cols-12 gap-4 -mt-6">
        <div className="col-span-full">
          <ProjectProfile launchpadAddress={launchpadAddress} />
        </div>
        <div className="col-span-full flex items-center justify-between">
          <p className="opacity-60 text-sm">End in</p>
          <LaunchpadTimeLine launchpadAddress={launchpadAddress} />
        </div>
        <div className="col-span-full flex items-center justify-between">
          <p className="opacity-60 text-sm">Price</p>
        </div>
        <div className="col-span-full flex items-center justify-between">
          <p className="opacity-60 text-sm">Sold</p>
        </div>
        <div className="col-span-full flex items-center justify-between">
          <p className="opacity-60 text-sm">Fundraising goal</p>
        </div>
        <div className="col-span-full flex items-center justify-between">
          <p className="text-sm line-clamp-2">{projectProfile?.description}</p>
        </div>
      </div>
    </div>
  )
}
