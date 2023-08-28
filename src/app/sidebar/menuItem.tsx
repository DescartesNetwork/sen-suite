'use client'
import Link from 'next/link'
import classNames from 'classnames'
import { usePathname } from 'next/navigation'

import {
  BookPlus,
  Repeat,
  Droplets,
  GraduationCap,
  BarChartBig,
  BadgePercent,
  Rocket,
  Home,
} from 'lucide-react'

const routes = [
  {
    route: '/',
    name: 'Home',
    Logo: Home,
  },
  {
    route: '/academy',
    name: 'Academy',
    Logo: GraduationCap,
  },
  {
    route: '/swap',
    name: 'Swap',
    Logo: Repeat,
  },
  {
    route: '/pools',
    name: 'Liquidity Pool',
    Logo: BarChartBig,
    disabled: true,
  },
  {
    route: '/farming',
    name: 'Farming',
    Logo: BadgePercent,
  },
  {
    route: '/airdrop',
    name: 'Airdrop',
    Logo: Droplets,
    childrens: [
      {
        route: '/airdrop/bulk-sender',
        name: 'Bulk Sender',
      },
      {
        route: '/airdrop/merkle-distribution',
        name: 'Merkle Distribution',
      },
    ],
  },
  {
    route: '/launchpad',
    name: 'Launchpad',
    Logo: Rocket,
    disabled: true,
  },
  {
    route: '/token-creation',
    name: 'Token Creation',
    Logo: BookPlus,
  },
]
export default function MenuItem({ open }: { open: boolean }) {
  const pathname = usePathname()
  console.log('path', pathname)

  return (
    <ul className="flex flex-nowrap overflow-y-auto h-4/6 menu menu-vertical menu-md sidebar-menu">
      {routes.map(({ route, name, Logo, disabled, childrens }) =>
        childrens?.length ? (
          <li key={route}>
            <details className="w-full">
              <summary
                className={classNames('px-4 py-3', {
                  'after:w-0': !open,
                })}
              >
                <Logo strokeWidth={1.5} className="menu-logo opacity-60" />
                <p className="menu-option opacity-60 font-semibold">{name}</p>
              </summary>
              <ul
                className={classNames('ml-0 pl-0 before:w-0', {
                  hidden: !open,
                })}
              >
                {childrens.map(({ route, name }) => (
                  <li key={route}>
                    <Link
                      href={disabled ? '#' : route}
                      className={classNames('pl-11 py-3', {
                        focus: pathname === route,
                      })}
                    >
                      <p className="menu-option opacity-60 font-semibold ml-1">
                        {name}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ) : (
          <li key={route} className={classNames({ disabled: disabled })}>
            <Link
              href={disabled ? '#' : route}
              className={classNames('px-4 py-3', {
                focus: pathname === route,
              })}
            >
              <Logo strokeWidth={1.5} className="menu-logo opacity-60" />
              <p className="menu-option opacity-60 font-semibold">{name}</p>
            </Link>
          </li>
        ),
      )}
    </ul>
  )
}
