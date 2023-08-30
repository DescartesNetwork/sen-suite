'use client'

import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/providers/ui.provider'

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className="menu-item"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <label className="swap swap-rotate">
        <input
          type="checkbox"
          onChange={(e) => setTheme(e.target.checked ? 'light' : 'dark')}
          checked={theme === 'dark'}
        />
        <p className="swap-on">
          <Moon strokeWidth={1.5} className="w-5 h-5" />
        </p>
        <p className="swap-off">
          <Sun strokeWidth={1.5} className="w-5 h-5" />
        </p>
      </label>
      <p className="menu-option capitalize">{`${theme} theme`}</p>
    </div>
  )
}
