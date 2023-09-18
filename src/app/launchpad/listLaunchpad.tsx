'use client'
import classNames from 'classnames'

import Empty from '@/components/empty'
import LaunchpadCard from './launchpadCard'

import { LaunchpadSate, useFilterLaunchpad } from '@/hooks/launchpad.hook'

type ListLaunchpadProps = {
  state: LaunchpadSate
}

export default function ListLaunchpad({ state }: ListLaunchpadProps) {
  const launchpadAddresses = useFilterLaunchpad(state)
  const completed = state === LaunchpadSate.completed

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-full flex items-center justify-between">
        <h5 className="capitalize">
          {state}{' '}
          <span className="badge rounded-lg">{launchpadAddresses.length}</span>
        </h5>
        <button className="btn btn-ghost btn-sm">View all</button>
      </div>
      <div className="col-span-full grid grid-cols-12 gap-6">
        {launchpadAddresses.slice(0, 2).map((launchpadAddress) => (
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
