'use client'
import classNames from 'classnames'

import {
  BookPlus,
  Repeat,
  Droplets,
  GraduationCap,
  BarChartBig,
  Leaf,
  Rocket,
  Home,
} from 'lucide-react'
import MenuItem, { PropsMenu } from './menuItem'

const ROUTES: PropsMenu[] = [
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
    Logo: Leaf,
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

export default function NavigationMenu({ open }: { open: boolean }) {
  return (
    <ul className="flex flex-nowrap overflow-y-auto menu menu-vertical menu-md sidebar-menu">
      {ROUTES.map((item) => (
        <li key={item.name} className={classNames({ disabled: item.disabled })}>
          <MenuItem item={item} open={open} />
        </li>
      ))}
    </ul>
  )
}
