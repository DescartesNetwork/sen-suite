'use client'
import Link from 'next/link'
import classNames from 'classnames'
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react'

import { PropsMenu } from './menu'

export default function DropdownMenu({
  item,
  pathname,
}: {
  item: PropsMenu
  pathname: string
}) {
  const {
    refs: { setReference, setFloating },
    floatingStyles,
  } = useFloating({
    whileElementsMounted: autoUpdate,
    placement: 'right-start',
    strategy: 'fixed',
    middleware: [offset(7), flip(), shift()],
  })

  const { route, name, Logo, disabled, children } = item

  return (
    <li key={route} className="dropdown p-0 flex static">
      <label
        tabIndex={0}
        ref={setReference}
        className={classNames('menu-item gap-2', {
          focus: pathname.includes(route),
        })}
      >
        {Logo && <Logo strokeWidth={1.5} className="menu-logo opacity-60" />}
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu menu-md p-2 shadow-xl bg-base-100 rounded-box z-10 m-0"
        style={floatingStyles}
        ref={setFloating}
      >
        <li>
          <p className="menu-title">{name}</p>
        </li>
        {children?.map(({ route, name }) => (
          <li key={name}>
            <Link
              href={disabled ? '#' : route}
              className={classNames('pl-8 opacity-60 hover:opacity-100', {
                'opacity-100': pathname === route,
              })}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  )
}
