'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

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

export default function Navigation() {
  const pathname = usePathname()
  return TABS.map(({ title, route }, i) => (
    <Tab key={i} title={title} to={route} active={pathname === route} />
  ))
}
