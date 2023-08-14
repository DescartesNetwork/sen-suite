'use client'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Tabs = [
  {
    title: 'Create Token',
    route: '/token-creation/new-token',
  },
  {
    title: 'Edit Token',
    route: '/token-creation/edit-token',
  },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <div className="tabs tabs-boxed">
      {Tabs.map(({ title, route }) => (
        <Link
          key={route}
          className={classNames('tab', { 'tab-active': pathname === route })}
          href={route}
        >
          {title}
        </Link>
      ))}
    </div>
  )
}
