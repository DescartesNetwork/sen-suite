'use client'
import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Tabs = [
  {
    title: 'Create Token',
    route: '/token-creation/new-token',
  },
  {
    title: 'Edit Token',
    route: '/token-creation/edit-token',
  },
]

export default function TokenCreationLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 justify-center gap-4">
      <div className="flex flex-row w-full justify-center">
        <div className="tabs tabs-boxed">
          {Tabs.map(({ title, route }) => (
            <Link
              key={route}
              className={
                'tab' + (pathname.startsWith(route) ? ' tab-active' : '')
              }
              href={route}
            >
              {title}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-row w-full justify-center">
        <div className="max-w-[360px] sm:min-w-[240px] md:min-w-[360px]">
          {children}
        </div>
      </div>
    </div>
  )
}
