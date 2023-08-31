import Link from 'next/link'

import {
  Twitter,
  Send,
  ChevronLeftSquare,
  ChevronRightSquare,
} from 'lucide-react'
import Island from '@/components/island'
import WalletButton from './walletButton'
import ThemeSwitch from './themeSwitch'
import { MenuLoading } from './index'

type SystemMenuProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function SystemMenu({ open, setOpen }: SystemMenuProps) {
  return (
    <ul className="menu menu-vertical menu-md">
      <li>
        <Island Loading={MenuLoading}>
          <WalletButton />
        </Island>
      </li>
      <div className="divider mx-4 my-0" />
      <li>
        <Link
          className="menu-item gap-2"
          href="https://twitter.com/SentreProtocol"
          target="_blank"
          rel="noreferrer"
        >
          <Twitter strokeWidth={1.5} className="menu-logo" />
          <p className="menu-option">Twitter</p>
        </Link>
      </li>
      <li>
        <Link
          className="menu-item gap-2"
          href="https://t.me/Sentre"
          target="_blank"
          rel="noreferrer"
        >
          <Send strokeWidth={1.5} className="menu-logo" />
          <p className="menu-option">Telegram</p>
        </Link>
      </li>
      <li>
        <Island Loading={MenuLoading}>
          <ThemeSwitch />
        </Island>
      </li>
      <li onClick={() => setOpen(!open)}>
        <span className="menu-item gap-1">
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
      </li>
    </ul>
  )
}
