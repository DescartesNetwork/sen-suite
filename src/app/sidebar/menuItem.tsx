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
  LucideIcon,
} from 'lucide-react'
import { Fragment } from 'react'

export type MenuItems = {
  route: string
  name: string
  Logo?: LucideIcon
  disabled?: boolean
  children?: MenuItems[]
}

const ROUTES: MenuItems[] = [
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
    children: [
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

const RenderItem = ({ name, Logo }: { name: string; Logo?: LucideIcon }) => {
  return (
    <Fragment>
      {Logo && <Logo strokeWidth={1.5} className="menu-logo opacity-60" />}
      <p className="menu-option menu-text">{name}</p>
    </Fragment>
  )
}

const RenderMenu = ({
  items,
  open,
  setOpen,
  className,
}: {
  items: MenuItems[]
  open: boolean
  setOpen: (open: boolean) => void
  className?: string
}) => {
  const pathname = usePathname()

  return (
    <Fragment>
      {items.map(({ route, name, Logo, disabled, children }) => {
        if (children?.length)
          return (
            <li className={className} key={route}>
              <details onClick={() => setOpen(true)}>
                <summary
                  className={classNames('px-4 py-3', {
                    'after:w-0': !open,
                  })}
                >
                  <RenderItem Logo={Logo} name={name} />
                </summary>
                <ul
                  className={classNames('ml-0 pl-0 before:w-0', {
                    hidden: !open,
                  })}
                >
                  <RenderMenu
                    className="pl-11"
                    items={children}
                    open={open}
                    setOpen={setOpen}
                  />
                </ul>
              </details>
            </li>
          )

        return (
          <li key={route} className={classNames({ disabled: disabled })}>
            <Link
              href={disabled ? '#' : route}
              className={classNames(`px-4 py-3 ${className}`, {
                focus: pathname === route,
              })}
            >
              <RenderItem Logo={Logo} name={name} />
            </Link>
          </li>
        )
      })}
    </Fragment>
  )
}

export default function MenuItem({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  return (
    <ul className="flex flex-nowrap overflow-y-auto h-4/6 menu menu-vertical menu-md sidebar-menu">
      <RenderMenu items={ROUTES} open={open} setOpen={setOpen} />
    </ul>
  )
}
