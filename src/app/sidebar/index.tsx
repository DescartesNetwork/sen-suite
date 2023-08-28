'use client'
import { Fragment, ReactNode, useState } from 'react'
import Link from 'next/link'
import { useKey } from 'react-use'
import classNames from 'classnames'

import {
  ChevronLeftSquare,
  ChevronRightSquare,
  Send,
  Twitter,
  Menu,
} from 'lucide-react'
import Brand from '@/components/brand'
import Island from '@/components/island'
import WalletButton from './walletButton'
import ThemeSwitch from './themeSwitch'
import MenuItem from './menuItem'

import './index.scss'

function MenuLoading() {
  return (
    <li>
      <a href="#">
        <span className="menu-logo loading loading-ring loading-xs" />
      </a>
    </li>
  )
}

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
        <Link className="mb-5 ml-6 mt-4" href="/">
          <Brand
            size={32}
            style={{ marginLeft: -4, marginRight: -4 }}
            named={open}
          />
        </Link>
        {/* Menu Selection */}
        <MenuItem open={open} />

        <div className="menu menu-vertical menu-md">
          <Island Loading={MenuLoading}>
            <WalletButton />
          </Island>
          <div className="divider mx-4 my-0" />
          <Link
            className="px-4 py-3 flex flex-row gap-2 hover:bg-[#EFF0F1] hover:text-[#616973] rounded-lg"
            href="https://twitter.com/SentreProtocol"
            target="_blank"
            rel="noreferrer"
          >
            <Twitter strokeWidth={1.5} className="menu-logo" />
            <p className="menu-option">Twitter</p>
          </Link>
          <Link
            className="px-4 py-3 flex flex-row gap-2 hover:bg-[#EFF0F1] hover:text-[#616973] rounded-lg"
            href="https://t.me/Sentre"
            target="_blank"
            rel="noreferrer"
          >
            <Send strokeWidth={1.5} className="menu-logo" />
            <p className="menu-option">Telegram</p>
          </Link>
          <Island Loading={MenuLoading}>
            <ThemeSwitch />
          </Island>
          <span
            onClick={() => setOpen(!open)}
            className="flex flex-row gap-1 items-center px-4 py-3 hover:bg-[#EFF0F1] hover:text-[#616973] rounded-lg cursor-pointer"
          >
            <label className="menu-logo swap swap-rotate">
              <input
                type="checkbox"
                onClick={(e) => e.stopPropagation()}
                checked={open}
                readOnly
              />
              <p className="swap-on">
                <ChevronLeftSquare strokeWidth={1.5} className="menu-logo" />
              </p>
              <p className="swap-off">
                <ChevronRightSquare strokeWidth={1.5} className="menu-logo" />
              </p>
            </label>
            <div className="menu-option pl-2 gap-1">
              <span className="join opacity-60">
                <kbd className="join-item kbd !kbd-xs">ctrl</kbd>
                <kbd className="join-item kbd !kbd-xs">⌘</kbd>
              </span>
              <span>+</span>
              <kbd className="kbd !kbd-xs opacity-60">K</kbd>
            </div>
          </span>
        </div>
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
