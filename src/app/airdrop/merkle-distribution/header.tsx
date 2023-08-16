'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

import Link from 'next/link'
import {
  ChevronLeft,
  DownloadCloud,
  LayoutDashboard,
  ScrollText,
} from 'lucide-react'

enum MenuKey {
  Dashboard,
  Airdrop,
  Vesting,
}

const menus = [
  {
    route: '/airdrop/merkle-distribution',
    name: 'Dashboard',
    key: MenuKey.Dashboard,
    Logo: LayoutDashboard,
  },
  {
    route: '/airdrop/merkle-distribution/airdrop',
    name: 'Airdrop',
    key: MenuKey.Airdrop,
    Logo: DownloadCloud,
  },
  {
    route: '/airdrop/merkle-distribution/vesting',
    name: 'Vesting',
    key: MenuKey.Vesting,
    Logo: ScrollText,
  },
]

export default function MerkleDistributionHeader() {
  const pathname = usePathname()
  const { push } = useRouter()

  const onBack = useCallback(() => {
    const hops = pathname.split('/')
    hops.pop()
    return push(hops.join('/'))
  }, [push, pathname])

  const activeKey = useMemo(() => {
    if (pathname === '/airdrop/merkle-distribution') return MenuKey.Dashboard
    const hops = pathname.split('/')
    if (hops.slice(2, hops.length).includes('airdrop')) return MenuKey.Airdrop
    return MenuKey.Vesting
  }, [pathname])

  return (
    <div className="card bg-base-100 p-4 flex-row items-center">
      <div className="flex-auto">
        <button className="btn btn-sm btn-circle" onClick={onBack}>
          <ChevronLeft />
        </button>
      </div>
      <div className=" flex gap-10">
        {menus.map(({ Logo, name, route, key }, i) => (
          <Link
            href={route}
            key={i}
            className={
              activeKey === key
                ? 'border-b-2 border-primary pb-2 text-primary'
                : 'hover:border-b-2 border-primary pb-2'
            }
          >
            <div className="flex gap-2">
              <Logo />
              <p className="hidden md:flex">{name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
