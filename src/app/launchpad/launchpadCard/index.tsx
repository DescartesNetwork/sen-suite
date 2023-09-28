'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'

import { User } from 'lucide-react'
import ProjectProfile from './projectProfile'
import LaunchpadTimeLine from './launchpadTimeLine'
import CompletedCard from './completedCard'
import Fundraising from './fundraising'
import Sold from './sold'

import { useLaunchpadMetadata, useTokenPrice } from '@/hooks/launchpad.hook'
import { numeric } from '@/helpers/utils'
import {
  useCalculateMetric,
  useFilterCheques,
  useLaunchpadByAddress,
} from '@/providers/launchpad.provider'

type LaunchpadCardProps = {
  launchpadAddress: string
  completed?: boolean
}
export default function LaunchpadCard({
  launchpadAddress,
  completed = false,
}: LaunchpadCardProps) {
  const projectProfile = useLaunchpadMetadata(launchpadAddress)
  const price = useTokenPrice(launchpadAddress)
  const cheques = useFilterCheques(launchpadAddress)
  const { publicKey } = useWallet()
  const { totalUsers } = useCalculateMetric(cheques)
  const { authority, startTime } = useLaunchpadByAddress(launchpadAddress)
  const isStarted = Date.now() / 1000 > startTime.toNumber()

  if (completed) return <CompletedCard launchpadAddress={launchpadAddress} />
  return (
    <Link
      href={`/launchpad/launchpad-details?launchpadAddress=${launchpadAddress}`}
      className="h-full relative border cursor-pointer rounded-3xl"
    >
      <img
        src={projectProfile?.coverPhoto}
        alt="launchpad-img"
        className="w-full aspect-video rounded-t-3xl object-cover"
        width={100}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null // prevents looping
          currentTarget.src = '/panel-light.jpg'
        }}
      />
      <div className="rounded-3xl min-h-[400px] card bg-base-100 p-6 grid grid-cols-12 gap-4 -mt-6">
        <div className="col-span-full flex justify-between items-start">
          <ProjectProfile launchpadAddress={launchpadAddress} />
          {publicKey && publicKey.equals(authority) && (
            <User className="p-2 bg-base-200 rounded-full" size={40} />
          )}
        </div>
        <div className="col-span-full flex items-center justify-between">
          <p className="opacity-60 text-sm">End in</p>
          <LaunchpadTimeLine launchpadAddress={launchpadAddress} />
        </div>
        <div className="col-span-full flex items-center justify-between">
          <p className="opacity-60 text-sm">Price</p>
          <p>{numeric(price).format('$0a.[0000]')}</p>
        </div>
        <div className="col-span-full flex items-center justify-between">
          <p className="opacity-60 text-sm">
            {isStarted ? 'Sold' : 'Total raise'}
          </p>
          <Sold launchpadAddress={launchpadAddress} />
        </div>
        <div className="col-span-full">
          <Fundraising launchpadAddress={launchpadAddress} />
        </div>
        <div className="col-span-full flex gap-1 items-center">
          <p className="opacity-60 text-sm">Participants: </p>
          <p>{totalUsers}</p>
        </div>
        <div className="col-span-full flex items-center justify-between">
          <p className="text-sm line-clamp-2">{projectProfile?.description}</p>
        </div>
      </div>
    </Link>
  )
}
