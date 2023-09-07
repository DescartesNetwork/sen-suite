import { ReactNode } from 'react'
import type { Metadata } from 'next'

import './index.scss'

export const metadata: Metadata = {
  title: 'Sentre Home',
  description: '',
}

export default function AcademyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="context overflow-auto flex h-full w-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all">
      {children}
    </div>
  )
}
