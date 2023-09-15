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
  LucideIcon,
} from 'lucide-react'
import MenuItem from './menuItem'

export type MenuItemData = {
  route: string
  name: string
  Logo?: LucideIcon
  disabled?: boolean
  children?: MenuItemData[]
}

type NavigateMenuProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

const ROUTES: MenuItemData[] = [
  { route: '/', name: 'Home', Logo: Home },
  { route: '/academy', name: 'Academy', Logo: GraduationCap },
  { route: '/swap', name: 'Swap', Logo: Repeat },
  {
    route: '/pools',
    name: 'Liquidity Pools',
    Logo: BarChartBig,
  },
  { route: '/farming', name: 'Farming', Logo: Leaf },
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
  { route: '/launchpad', name: 'Launchpad', Logo: Rocket, disabled: true },
  { route: '/token-creation', name: 'Token Creation', Logo: BookPlus },
]

export default function NavigateMenu({ open }: NavigateMenuProps) {
  return (
    <ul className="flex flex-nowrap overflow-y-auto menu menu-vertical menu-md sidebar-menu">
      {ROUTES.map((route) => (
        <li
          key={route.name}
          className={classNames({ disabled: route.disabled })}
        >
          <MenuItem menuItemData={route} open={open} />
        </li>
      ))}
    </ul>
  )
}
