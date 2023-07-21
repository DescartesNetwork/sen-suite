'use client'

import Link from 'next/link'
import FarmingPanel from './panel'
import { Search } from 'lucide-react'

function Tab({
  title,
  to,
  active = false,
}: {
  title: string
  to: string
  active?: boolean
}) {
  return (
    <Link
      className={'btn btn-ghost btn-sm' + (active ? ' btn-active' : '')}
      href={to}
    >
      {title}
    </Link>
  )
}

const TABS = [
  {
    title: 'All',
    route: '/farming',
    active: true,
  },
  {
    title: 'My Farms',
    route: '/farming/my-farms',
  },
  {
    title: 'Expired Farms',
    route: '/farming/expired-farms',
  },
  {
    title: 'Upcoming Farms',
    route: '/farming/upcoming-farms',
  },
]

export default function Farming() {
  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-full">
        <FarmingPanel />
      </div>
      <div className="col-span-full flex flex-row gap-2 overflow-auto no-scrollbar">
        {TABS.map(({ title, route, active }, i) => (
          <Tab key={i} title={title} to={route} active={active} />
        ))}
      </div>
      <div className="col-span-full flex flex-row gap-2 items-center">
        <div className="flex-auto relative flex flex-row items-center">
          <Search className="pointer-events-none w-4 h-4 absolute left-3" />
          <input
            className="input rounded-xl w-full pl-10 bg-base-200"
            placeholder="Search by name, address"
          />
        </div>
        <p className="text-sm">Sorted by:</p>
      </div>
    </div>
  )
}
