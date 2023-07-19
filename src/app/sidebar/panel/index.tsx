'use client'
import { useKey } from 'react-use'

import { PanelLeftClose, PanelLeftOpen, Send, Twitter } from 'lucide-react'
import Island from '@/components/island'
import ThemeSwitch from './themeSwitch'

export type PanelProps = {
  open?: boolean
  onOpen?: (open: boolean) => void
}

export default function Panel({ open = false, onOpen = () => {} }: PanelProps) {
  useKey(
    (e) => e.metaKey && e.key === 'k',
    () => onOpen(!open),
  )

  return (
    <ul className="menu menu-md rounded-box">
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
        <Island>
          <ThemeSwitch />
        </Island>
      </li>
      <li onClick={() => onOpen(!open)}>
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
  )
}
