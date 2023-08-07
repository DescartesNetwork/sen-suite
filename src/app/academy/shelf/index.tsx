'use client'
import { useMemo, useState } from 'react'

import Empty from '@/components/empty'
import Signature from './signature'
import Thumbnail from './thumbnail'
import Lite from './lite'

import { useAcademyPaging } from '@/hooks/academy.hook'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export type ShelfProps = {
  pageIds: string[]
  metadata: PageMap
}

export default function Shelf({ pageIds, metadata }: ShelfProps) {
  const [index, setIndex] = useState(0)
  const { pinnedIds, thumbnailIds } = useAcademyPaging(pageIds, metadata)
  const { bannerId, otherIds } = useMemo(() => {
    const len = pinnedIds.length
    const pos = ((index % len) + len) % len
    const bannerId = pinnedIds[pos]
    const otherIds = pinnedIds.filter((pageId) => pageId !== bannerId)
    return { bannerId, otherIds }
  }, [pinnedIds, index])

  return (
    <div className="grid grid-cols-12 gap-6 @container">
      {bannerId && (
        <div className="col-span-full flex flex-row items-center">
          <Signature pageId={bannerId} metadata={metadata[bannerId]} />
          <button
            className="btn btn-circle absolute left-4"
            onClick={() => setIndex(index - 1)}
          >
            <ArrowLeft />
          </button>
          <button
            className="btn btn-circle absolute right-4"
            onClick={() => setIndex(index + 1)}
          >
            <ArrowRight />
          </button>
        </div>
      )}
      {otherIds.map((pageId) => (
        <div
          key={pageId}
          className="col-span-full @lg:col-span-6 @2xl:col-span-4 @4xl:col-span-3"
        >
          <Lite pageId={pageId} metadata={metadata[pageId]} />
        </div>
      ))}
      <div className="col-span-full" />
      {thumbnailIds.map((pageId) => (
        <div
          key={pageId}
          className="col-span-full @xl:col-span-6 @4xl:col-span-4"
        >
          <Thumbnail pageId={pageId} metadata={metadata[pageId]} />
        </div>
      ))}
      {!thumbnailIds.length && (
        <div className="col-span-full flex flex-row justify-center p-8">
          <Empty />
        </div>
      )}
    </div>
  )
}
