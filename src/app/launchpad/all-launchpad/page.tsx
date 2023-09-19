'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import classNames from 'classnames'

import { ArrowLeft } from 'lucide-react'
import LaunchpadCard from '../launchpadCard'
import Empty from '@/components/empty'

import { LaunchpadSate, useFilterLaunchpad } from '@/hooks/launchpad.hook'

export default function AllLaunchpad() {
  const { back, push } = useRouter()
  const searchParams = useSearchParams()
  const state = searchParams.get('state')
  const launchpadAddresses = useFilterLaunchpad(state as LaunchpadSate)
  const completed = state === LaunchpadSate.completed

  if (!Object.values(LaunchpadSate).includes(state as LaunchpadSate))
    return push('/launchpad')

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-full">
        <button className="btn btn-sm btn-ghost rounded-full" onClick={back}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
      <div className="col-span-full flex items-center gap-3">
        <h4 className="capitalize">{state}</h4>
        <span className="badge rounded-lg">{launchpadAddresses.length}</span>
      </div>
      <div className="col-span-full grid grid-cols-12 gap-6">
        {launchpadAddresses.map((launchpadAddress) => (
          <div
            className={classNames('md:col-span-6 col-span-full', {
              '!col-span-full': completed,
            })}
            key={launchpadAddress}
          >
            <LaunchpadCard
              completed={completed}
              launchpadAddress={launchpadAddress}
            />
          </div>
        ))}
        {!launchpadAddresses.length && (
          <div className="col-span-full">
            <Empty />
          </div>
        )}
      </div>
    </div>
  )
}
