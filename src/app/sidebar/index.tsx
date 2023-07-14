'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { CandlestickChart, Droplets, Leaf, Rocket } from 'lucide-react'
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
    route: '/farming',
    name: 'Farming',
    Logo: Leaf,
  },
  {
    route: '/airdrop',
    name: 'Airdrop',
    Logo: Droplets,
  },
  {
    route: '/launchpad',
    name: 'Launchpad',
    Logo: Rocket,
  },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <aside className={`sidebar ${!open ? '' : 'open'} flex flex-col`}>
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
        {routes.map(({ route, name, Logo }) => (
          <li key={route}>
            <Link
              href={route}
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
