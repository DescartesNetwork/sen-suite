'use client'
import Link from 'next/link'
import classNames from 'classnames'
import { usePathname } from 'next/navigation'

import { LucideIcon } from 'lucide-react'
import DropdownMenu from './dropdownMenu'

export type PropsMenu = {
  route: string
  name: string
  Logo?: LucideIcon
  disabled?: boolean
  children?: PropsMenu[]
}

export const SubMenu = ({ item, open }: { item: PropsMenu; open: boolean }) => {
  const { name, Logo, children } = item
  return (
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
        {children &&
          children.map((item) => (
            <li
              key={item.route}
              className={classNames({ disabled: item.disabled })}
            >
              <MenuItem item={item} open={open} style="pl-11" />
            </li>
          ))}
      </ul>
    </details>
  )
}

export default function MenuItem({
  item,
  open,
  style,
}: {
  item: PropsMenu
  open: boolean
  style?: string
}) {
  const { route, name, Logo, disabled, children } = item
  const pathname = usePathname()

  if (children)
    return open ? (
      <SubMenu item={item} open={open} />
    ) : (
      <DropdownMenu item={item} pathname={pathname} />
    )

  return (
    <Link
      href={disabled ? '#' : route}
      className={classNames(`px-4 py-3 ${style}`, {
        focus: pathname === route,
      })}
    >
      {Logo && <Logo strokeWidth={1.5} className="menu-logo opacity-60" />}
      <p className="menu-option menu-text">{name}</p>
    </Link>
  )
}
