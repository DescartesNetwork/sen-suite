'use client'
import { Fragment, ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useKey } from 'react-use'

import {
  BookPlus,
  CandlestickChart,
  Droplets,
  GraduationCap,
  Landmark,
  Leaf,
  Rocket,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Twitter,
  Menu,
} from 'lucide-react'
import Brand from '@/components/brand'
import Island from '@/components/island'
import WalletButton from './walletButton'
import ThemeSwitch from './themeSwitch'

import './index.scss'

const routes = [
  {
    route: '/academy',
    name: 'Academy',
    Logo: GraduationCap,
  },
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

function WalletIsland() {
  return (
    <Island
      loading={
        <li>
          <a href="#">
            <span className="menu-logo loading loading-ring loading-xs" />
          </a>
        </li>
      }
    >
      <WalletButton />
    </Island>
  )
}

export type SidebarProps = { children: ReactNode }

export default function Sidebar({ children }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useKey(
    (e) => e.metaKey && e.key === 'k',
    () => setOpen(!open),
  )

  return (
    <Fragment>
      {/* Overlay */}
      <div
        className={
          'fixed w-[100vw] h-[100dvh] top-0 left-0 bg-base-300 opacity-60 backdrop-blur-xl cursor-pointer transition-all z-40' +
          (!open ? ' hidden' : '')
        }
        onClick={() => setOpen(false)}
      />
      {/* Sidebar */}
      <aside
        className={'sidebar vertical max-md:mobile' + (open ? ' open' : '')}
      >
        <ul className="h-full menu menu-vertical menu-md">
          <li className="mb-8">
            <a href="/">
              <Brand
                size={24}
                style={{ marginLeft: -4, marginRight: -4 }}
                named={open}
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
          <div className="flex-auto" />
          <WalletIsland />
          <span className="divider mx-4 my-0"></span>
          <li>
            <a
              href="https://twitter.com/SentreProtocol"
              target="_blank"
              rel="noreferrer"
            >
              <Twitter className="menu-logo" />
              <p className="menu-option">Twitter</p>
            </a>
          </li>
          <li>
            <a href="https://t.me/Sentre" target="_blank" rel="noreferrer">
              <Send className="menu-logo" />
              <p className="menu-option">Telegram</p>
            </a>
          </li>
          <li>
            <Island
              loading={
                <a href="#">
                  <span className="menu-logo loading loading-ring loading-xs" />
                </a>
              }
            >
              <ThemeSwitch />
            </Island>
          </li>
          <li onClick={() => setOpen(!open)}>
            <span className="flex flex-row gap-1 items-center justify-between">
              <div className="menu-option pl-6 gap-1">
                <span className="join opacity-60">
                  <kbd className="join-item kbd !kbd-xs">ctrl</kbd>
                  <kbd className="join-item kbd !kbd-xs">⌘</kbd>
                </span>
                <span>+</span>
                <kbd className="kbd !kbd-xs opacity-60">K</kbd>
              </div>
              <label className="menu-logo swap swap-rotate">
                <input
                  type="checkbox"
                  onClick={(e) => e.stopPropagation()}
                  checked={open}
                  readOnly
                />
                <p className="swap-on">
                  <PanelLeftClose className="menu-logo" />
                </p>
                <p className="swap-off">
                  <PanelLeftOpen className="menu-logo" />
                </p>
              </label>
            </span>
          </li>
        </ul>
      </aside>
      {/* Mobile header & Page content */}
      <main className="flex-auto flex flex-col min-h-[100dvh]">
        <header className="sidebar horizontal pl-3 py-2 md:hidden">
          <ul className="w-full menu menu-horizontal menu-md flex flex-row items-center">
            <a href="/">
              <Brand size={24} named />
            </a>
            <div className="flex-auto" />
            <WalletIsland />
            <li>
              <a onClick={() => setOpen(true)}>
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
