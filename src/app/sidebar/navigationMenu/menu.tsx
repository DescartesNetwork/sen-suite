'use client'
import Link from 'next/link'
import classNames from 'classnames'

import { LucideIcon } from 'lucide-react'

export type PropsMenu = {
  route: string
  name: string
  Logo?: LucideIcon
  disabled?: boolean
  children?: PropsMenu[]
}

export const MenuItem = ({
  item,
  style,
  pathname,
}: {
  item: PropsMenu
  style?: string
  pathname: string
}) => {
  const { route, name, Logo, disabled } = item
  return (
    <li key={route} className={classNames({ disabled })}>
      <Link
        href={disabled ? '#' : route}
        className={classNames(`px-4 py-3 ${style}`, {
          focus: pathname === route,
        })}
      >
        {Logo && <Logo strokeWidth={1.5} className="menu-logo opacity-60" />}
        <p className="menu-option menu-text">{name}</p>
      </Link>
    </li>
  )
}

export default function Menu({
  item,
  open,
  pathname,
}: {
  item: PropsMenu
  open: boolean
  pathname: string
}) {
  const { route, name, Logo, children } = item
  return (
    <li key={route}>
      <details>
        <summary
          className={classNames('px-4 py-3', {
            'after:w-0 after:justify-end': !open,
          })}
        >
          {Logo && <Logo strokeWidth={1.5} className="menu-logo opacity-60" />}
          <p className="menu-option menu-text">{name}</p>
        </summary>
        <ul
          className={classNames('ml-0 pl-0 before:w-0', {
            hidden: !open,
          })}
        >
          {children?.map((item) => (
            <MenuItem
              key={item.name}
              item={item}
              pathname={pathname}
              style="pl-11"
            />
          ))}
        </ul>
      </details>
    </li>
  )
}
