'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Twitter,
  Send,
  ChevronLeftSquare,
  ChevronRightSquare,
} from 'lucide-react'
import Island from '@/components/island'
import WalletButton from './walletButton'
import ThemeSwitch from './themeSwitch'

export function MenuLoading() {
  return (
    <li>
      <a href="#">
        <span className="menu-logo loading loading-ring loading-xs" />
      </a>
    </li>
  )
}

export default function MenuInfo({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const pathname = usePathname()
  console.log('path', pathname)

  return (
    <div className="menu menu-vertical menu-md">
      <Island Loading={MenuLoading}>
        <WalletButton />
      </Island>
      <div className="divider mx-4 my-0" />
      <Link
        className="px-4 py-3 flex flex-row gap-2 hover:bg-neutral hover:text-neutral-100 rounded-lg"
        href="https://twitter.com/SentreProtocol"
        target="_blank"
        rel="noreferrer"
      >
        <Twitter strokeWidth={1.5} className="menu-logo" />
        <p className="menu-option">Twitter</p>
      </Link>
      <Link
        className="px-4 py-3 flex flex-row gap-2 hover:bg-neutral hover:text-neutral-100 rounded-lg"
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
        className="flex flex-row gap-1 items-center px-4 py-3 hover:bg-neutral hover:text-neutral-100 rounded-lg cursor-pointer"
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
          <span className="join text-neutral dark:text-neutral-100">
            <kbd className="join-item kbd !kbd-xs">ctrl</kbd>
            <kbd className="join-item kbd !kbd-xs">⌘</kbd>
          </span>
          <kbd className="kbd !kbd-xs text-neutral dark:text-neutral-100">
            K
          </kbd>
        </div>
      </span>
    </div>
  )
}
