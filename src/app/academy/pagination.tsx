'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, ArrowRight } from 'lucide-react'

import { useAcademyPaging } from '@/hooks/academy.hook'
import { ChangeEvent, useCallback, useMemo } from 'react'

export type PaginationProps = {
  pageIds: string[]
  metadata: PageMap
}

export default function Pagination({ pageIds, metadata }: PaginationProps) {
  const { push } = useRouter()
  const { tag, page, total, limit } = useAcademyPaging(pageIds, metadata)

  const min = 1
  const max = Math.ceil(total / limit)
  const prev = Math.max(min, page - 1)
  const next = Math.min(max, page + 1)

  const pages = useMemo(() => {
    const pages = []
    for (let i = min; i <= max; i++) pages.push(i)
    return pages
  }, [min, max])

  const onPage = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const page = e.target.value
      const params = new URLSearchParams(!tag ? { page } : { tag, page })
      return push(`/academy?${params.toString()}`)
    },
    [push, tag],
  )

  return (
    <div className="join">
      <Link
        className={
          'join-item btn btn-square' +
          (page === min ? ' btn-disabled cursor-not-allowed' : '')
        }
        href={{
          pathname: page === min ? '#' : '/academy',
          query: !tag ? { page: prev } : { tag, page: prev },
        }}
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <select
        className="join-item btn btn-square appearance-none focus:outline-none"
        value={page}
        onChange={onPage}
      >
        {pages.map((i) => (
          <option key={i}>{i}</option>
        ))}
      </select>
      <Link
        className={
          'join-item btn btn-square' +
          (page === max ? ' btn-disabled cursor-not-allowed' : '')
        }
        href={{
          pathname: page === max ? '#' : '/academy',
          query: !tag ? { page: next } : { tag, page: next },
        }}
      >
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
