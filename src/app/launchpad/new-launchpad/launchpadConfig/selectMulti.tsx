'use client'

import { ReactNode } from 'react'
import { useFloating, offset, flip, shift } from '@floating-ui/react'

import { ChevronDown } from 'lucide-react'
import CategoryTag, {
  acceptable_categories,
} from '../../launchpadCard/categoryTag'
import classNames from 'classnames'

export type ItemProps = {
  value: string
  key: string
  icon?: ReactNode
}

type SelectProps = {
  placeholder?: string
  items?: ItemProps[]
  max?: number
  selectedValues?: string[]
  onSelect?: (val: string[]) => void
}
export default function SelectMulti({
  placeholder = '',
  items = [],
  max,
  selectedValues = [],
  onSelect = () => {},
}: SelectProps) {
  const {
    refs: { setReference, setFloating },
    floatingStyles,
  } = useFloating({
    middleware: [offset(5), flip(), shift()],
  })

  const onChange = (value: string) => {
    const nextValue = [...selectedValues]
    const index = nextValue.indexOf(value)
    if (max && nextValue.length === max && index === -1) return
    if (index !== -1) nextValue.splice(index, 1)
    else nextValue.push(value)
    onSelect(nextValue)
  }

  return (
    <div className="dropdown">
      <label
        tabIndex={0}
        className="flex items-center bg-base-200 p-3 rounded-lg cursor-pointer"
        ref={setReference}
      >
        {placeholder && !selectedValues.length && (
          <p className="flex-auto opacity-60">{placeholder}</p>
        )}
        <div className="flex-auto flex gap-2 items-center">
          {selectedValues.map((value) => (
            <CategoryTag
              category={value as keyof typeof acceptable_categories}
              key={value}
            />
          ))}
        </div>

        <ChevronDown className="w-3 h-3" />
      </label>

      <ul
        tabIndex={0}
        className="dropdown-content grid grid-cols-12 z-[1] menu p-2 shadow bg-base-100 rounded-box w-full  max-h-96 overflow-y-auto overflow-x-hidden no-scrollbar"
        style={floatingStyles}
        ref={setFloating}
      >
        {items.map(({ key, value }) => (
          <li
            onClick={() => onChange(value)}
            className={classNames('col-span-full z-10', {
              '!bg-base-200': selectedValues.includes(value),
              'opacity-50':
                max &&
                selectedValues.length === max &&
                !selectedValues.includes(value),
            })}
            key={key}
          >
            <p className="cursor-not-allowed">{value}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
