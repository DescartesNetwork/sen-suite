'use client'
import { Fragment, ReactNode, useState } from 'react'
import Link from 'next/link'
import { useKey } from 'react-use'
import classNames from 'classnames'

import { Menu } from 'lucide-react'
import Brand from '@/components/brand'
import Island from '@/components/island'
import WalletButton from './walletButton'
import MenuItem from './menuItem'
import MenuInfo, { MenuLoading } from './menuInfo'

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
        className={classNames(
          'flex flex-col justify-between sidebar vertical max-md:mobile',
          {
            open,
          },
        )}
      >
        <Link className="p-4" href="/">
          <Brand size={32} style={{ marginLeft: 3 }} named={open} />
        </Link>
        {/* Menu Item */}
        <MenuItem open={open} setOpen={setOpen} />
        {/* Menu Infor */}
        <MenuInfo open={open} setOpen={setOpen} />
      </aside>
      {/* Mobile header & Page content */}
      <main className="flex-auto flex flex-col min-h-[100dvh]">
        <header className="sidebar horizontal pl-3 py-2 md:hidden">
          <ul className="w-full menu menu-horizontal menu-md flex flex-row items-center">
            <a href="/">
              <Brand size={24} named />
            </a>
            <div className="flex-auto" />
            <Island Loading={MenuLoading}>
              <WalletButton />
            </Island>
            <li>
              <a onClick={() => setOpen(true)} href="#">
                <Menu className="menu-logo" />
              </a>
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
