'use client'
import Link from 'next/link'

export type TabProps = {
  title: string
  to: string
  active?: boolean
}

export default function Tab({ title, to, active = false }: TabProps) {
  return (
    <Link
      className={'btn btn-ghost btn-sm' + (active ? ' btn-active' : '')}
      href={to}
    >
      {title}
    </Link>
  )
}
