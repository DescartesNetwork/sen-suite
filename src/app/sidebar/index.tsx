'use client'
import { Fragment, ReactNode, useState } from 'react'
import Link from 'next/link'
import { useKey } from 'react-use'
import classNames from 'classnames'

import { Menu } from 'lucide-react'
import Brand from '@/components/brand'
import Island from '@/components/island'
import WalletButton from './walletButton'
import NavigationMenu from './navigationMenu'

import SystemMenu, { MenuLoading } from './systemMenu'

import './index.scss'

export type SidebarProps = { children: ReactNode }

export default function Sidebar({ children }: SidebarProps) {
  const [open, setOpen] = useState(false)

  useKey(
    (e) => e.metaKey && e.key === 'k',
    () => setOpen(!open),
  )

  return (
    <Fragment>
      {/* Overlay */}
      <div
        className={classNames('overlay max-md:mobile', { open })}
        onClick={() => setOpen(false)}
      />
      {/* Sidebar */}
      <aside
        className={classNames('flex flex-col sidebar vertical max-md:mobile', {
          open,
        })}
      >
        <Link className="p-4" href="/">
          <Brand size={32} style={{ marginLeft: 3 }} named={open} />
        </Link>
        <NavigationMenu open={open} />
        <div className="flex-auto" />
        <SystemMenu open={open} setOpen={setOpen} />
      </aside>
      {/* Mobile header & Page content */}
      <main className="flex-auto flex flex-col min-h-[100dvh]">
        <header className="sidebar horizontal pl-3 py-2 md:hidden">
          <ul className="w-full menu menu-horizontal menu-md flex flex-row items-center">
            <li>
              <Link href="/">
                <Brand size={24} named />
              </Link>
            </li>
            <div className="flex-auto" />
            <li>
              <Island Loading={MenuLoading}>
                <WalletButton />
              </Island>
            </li>
            <li>
              <div className="menu-item" onClick={() => setOpen(true)}>
                <Menu className="menu-logo" />
              </div>
            </li>
          </ul>
        </header>
        <section className="flex-auto max-md:px-2 max-md:pb-2 md:pr-2 md:py-2">
          {children}
        </section>
      </main>
    </Fragment>
  )
}
