'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'

function Tab({
  title,
  to,
  active = false,
  disabled = false,
}: {
  title: string
  to: string
  active?: boolean
  disabled?: boolean
}) {
  return (
    <Link
      className={
        'btn btn-ghost btn-sm' +
        (active ? ' btn-active' : '') +
        (disabled ? ' btn-disabled' : '')
      }
      href={!disabled ? to : '#'}
    >
      {title}
    </Link>
  )
}

const TABS = [
  {
    title: 'All',
    route: '/farming',
    auth: false,
  },
  {
    title: 'My Farms',
    route: '/farming/my-farms',
    auth: true,
  },
  {
    title: 'Expired Farms',
    route: '/farming/expired-farms',
    auth: false,
  },
  {
    title: 'Upcoming Farms',
    route: '/farming/upcoming-farms',
    auth: false,
  },
]

export default function Navigation() {
  const pathname = usePathname()
  const { publicKey } = useWallet()

  return TABS.map(({ title, route, auth }, i) => (
    <Tab
      key={i}
      title={title}
      to={route}
      active={pathname === route}
      disabled={auth && !publicKey}
    />
  ))
}