'use client'

import {
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Twitter,
} from 'lucide-react'
import Island from '@/components/island'
import ThemeSwitch from './themeSwitch'

export type PanelProps = {
  open: boolean
  onOpen: (open: boolean) => void
}

export default function Panel({ open, onOpen }: PanelProps) {
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
          <MessagesSquare className="menu-logo" />
          <p className="menu-option">Telegram</p>
        </a>
      </li>
      <li>
        <Island>
          <ThemeSwitch />
        </Island>
      </li>
      <li>
        <label className="swap swap-rotate">
          <input
            type="checkbox"
            onChange={() => onOpen(!open)}
            checked={open}
          />
          <p className="swap-on">
            <PanelLeftClose className="menu-logo" />
          </p>
          <p className="swap-off">
            <PanelLeftOpen className="menu-logo" />
          </p>
        </label>
      </li>
    </ul>
  )
}
