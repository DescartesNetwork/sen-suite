'use client'
import Link from 'next/link'

import { ArrowLeft, ArrowRight } from 'lucide-react'

import { useAcademyPaging } from '@/hooks/academy.hook'

export type PaginationProps = {
  pageIds: string[]
  metadata: PageMap
}

export default function Pagination({ pageIds, metadata }: PaginationProps) {
  const { tag, page, total, limit } = useAcademyPaging(pageIds, metadata)

  const min = 1
  const max = Math.ceil(total / limit)
  const prev = Math.max(min, page - 1)
  const next = Math.min(max, page + 1)

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
      <button className="join-item btn">{page}</button>
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
