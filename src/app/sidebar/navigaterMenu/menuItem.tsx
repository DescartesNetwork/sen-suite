'use client'
import Link from 'next/link'
import classNames from 'classnames'
import { usePathname } from 'next/navigation'

import ListSubMenuItem from './listSubMenuItem'

import { MenuItemData } from './index'

export type MenuItemProps = {
  item: MenuItemData
  open?: boolean
}

export default function MenuItem({ item, open }: MenuItemProps) {
  const { route, name, Logo, disabled, children } = item
  const pathname = usePathname()

  if (children && !!children.length) {
    return <ListSubMenuItem item={item} open={open} />
  }

  return (
    <Link
      href={disabled ? '#' : route}
      className={classNames('px-4 py-3', {
        focus: pathname === route,
      })}
    >
      {Logo && <Logo strokeWidth={1.5} className="menu-logo opacity-60" />}
      <p className="menu-option menu-text">{name}</p>
    </Link>
  )
}
