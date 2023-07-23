'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  BookPlus,
  CandlestickChart,
  Droplets,
  Landmark,
  Leaf,
  Rocket,
} from 'lucide-react'
import Brand from '@/components/brand'
import Island from '@/components/island'
import WalletButton from './walletButton'
import Panel from './panel'

import './index.scss'

const routes = [
  {
    route: '/swap',
    name: 'Swap',
    Logo: CandlestickChart,
  },
  {
    route: '/pools',
    name: 'Liquidity Pool',
    Logo: Landmark,
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
    disabled: true,
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

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={`sidebar sticky top-0 ${
        !open ? '' : 'open'
      } flex flex-col z-10`}
    >
      <ul className="menu menu-md rounded-box flex-auto">
        <li className="mb-8">
          <a href="/">
            <Brand
              size={24}
              named={open}
              style={{ marginLeft: -4, marginRight: -4 }}
            />
          </a>
        </li>
        {routes.map(({ route, name, Logo, disabled }) => (
          <li key={route} className={disabled ? 'disabled' : ''}>
            <Link
              href={disabled ? '#' : route}
              className={pathname.startsWith(route) ? 'focus' : ''}
            >
              <p>
                <Logo className="menu-logo" />
              </p>
              <p className="menu-option font-semibold">{name}</p>
            </Link>
          </li>
        ))}
        <li className="flex-auto invisible"></li>
        <Island>
          <WalletButton />
        </Island>
        <span className="divider mx-4 mt-0 -mb-2"></span>
      </ul>
      <Panel open={open} onOpen={setOpen} />
    </aside>
  )
}
