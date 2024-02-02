'use client'
import { Fragment, ReactNode, useEffect } from 'react'
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

import { env } from '@/configs/env'

/**
 * Store
 */

export type UiStore = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useUiStore = create<UiStore>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        setTheme: (theme: Theme) => set({ theme }, false, 'setTheme'),
      }),
      { name: 'ui-storage' },
    ),
    {
      name: 'ui',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */

export default function UiProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme()

  // Listen theme events
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <Fragment>{children}</Fragment>
}

/**
 * Hook
 */

export function useTheme() {
  return useUiStore(({ theme, setTheme }) => ({ theme, setTheme }))
}
