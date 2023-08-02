'use client'
import { useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ExtendedRecordMap, PageBlock } from 'notion-types'
import { getBlockTitle } from 'notion-utils'

import { ArrowLeft } from 'lucide-react'

export type PageHeaderProps = {
  block: PageBlock
  map: ExtendedRecordMap
}

export default function PageHeader({ block, map }: PageHeaderProps) {
  const pathname = usePathname()
  const { push } = useRouter()

  const title = getBlockTitle(block, map)

  const onBack = useCallback(() => {
    const hops = pathname.split('/')
    hops.pop()
    return push(hops.join('/'))
  }, [push, pathname])

  return (
    <div className="flex flex-row gap-8 p-2 items-center">
      <button className="btn btn-sm btn-ghost rounded-full" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <p className="text-sm font-bold flex-auto text-end truncate">{title}</p>
    </div>
  )
}
