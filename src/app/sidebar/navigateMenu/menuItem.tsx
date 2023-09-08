import Link from 'next/link'
import classNames from 'classnames'
import { usePathname } from 'next/navigation'

import ListSubMenuItem from './listSubMenuItem'

import { MenuItemData } from './index'

type MenuItemProps = {
  menuItemData: MenuItemData
  open: boolean
}

export default function MenuItem({ menuItemData, open }: MenuItemProps) {
  const { route, name, Logo, disabled, children } = menuItemData
  const pathname = usePathname()

  if (children && !!children.length) {
    return <ListSubMenuItem menuItemData={menuItemData} open={open} />
  }

  return (
    <Link
      href={disabled ? '#' : route}
      className={classNames('px-4 py-3', {
        focus: pathname === route,
      })}
    >
      {Logo && <Logo className="menu-logo opacity-60" />}
      <p className="menu-option menu-text">{name}</p>
    </Link>
  )
}
