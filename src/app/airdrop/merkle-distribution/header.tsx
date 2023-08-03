'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'

import {
  ChevronLeft,
  DownloadCloud,
  LayoutDashboard,
  ScrollText,
} from 'lucide-react'

const menus = [
  {
    route: '/airdrop/merkle-distribution',
    name: 'Dashboard',
    Logo: LayoutDashboard,
  },
  {
    route: '/airdrop/merkle-distribution/airdrop',
    name: 'Airdrop',
    Logo: DownloadCloud,
  },
  {
    route: '/airdrop/merkle-distribution/vesting',
    name: 'Vesting',
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

  return (
    <div className="card bg-base-100 p-4 flex-row items-center">
      <div className="flex-auto flex gap-10">
        {menus.map(({ Logo, name, route }, i) => (
          <Link
            href={route}
            key={i}
            className={
              pathname === route
                ? 'border-b-2 border-primary pb-2 text-primary'
                : 'hover:border-b-2 border-primary pb-2'
            }
          >
            <div className="flex gap-2">
              <Logo />
              <p>{name}</p>
            </div>
          </Link>
        ))}
      </div>
      <button className="btn btn-sm btn-circle" onClick={onBack}>
        <ChevronLeft />
      </button>
    </div>
  )
}
