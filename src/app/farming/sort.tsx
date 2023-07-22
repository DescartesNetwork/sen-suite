'use client'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { SortState } from '@/providers/farming.provider'

export type SortProps = {
  title: string
  value?: SortState
  onChange?: (value: SortState) => void
}

export default function Sort({
  title,
  value = 0,
  onChange = () => {},
}: SortProps) {
  const states: SortState[] = [-1, 0, 1]
  return (
    <label
      className="flex flex-row gap-2 items-center cursor-pointer"
      onClick={() => onChange(states[(value + 2) % 3])}
    >
      <span className="text-sm font-bold select-none">{title}</span>
      <span className="flex flex-col items-center">
        <ChevronUp
          className={
            'w-3 h-3 opacity-40 stroke-[4px]' +
            (value === 1 ? ' !opacity-100' : '')
          }
        />
        <ChevronDown
          className={
            'w-3 h-3 opacity-40 stroke-[4px]' +
            (value === -1 ? ' !opacity-100' : '')
          }
        />
      </span>
    </label>
  )
}
