'use client'
import { useMemo } from 'react'

import Empty from '@/components/empty'
import Signature from './signature'
import Thumbnail from './thumbnail'
import Lite from './lite'

import { useAcademyPaging } from '@/hooks/academy.hook'

export type ShelfProps = {
  pageIds: string[]
  metadata: PageMap
}

export default function Shelf({ pageIds, metadata }: ShelfProps) {
  const { pinnedIds, thumbnailIds } = useAcademyPaging(pageIds, metadata)
  const { bannerId, otherIds } = useMemo(() => {
    const [bannerId, ...otherIds] = pinnedIds
    return { bannerId, otherIds }
  }, [pinnedIds])

  return (
    <div className="grid grid-cols-12 gap-6 @container">
      {bannerId && (
        <div className="col-span-full">
          <Signature pageId={bannerId} metadata={metadata[bannerId]} />
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
