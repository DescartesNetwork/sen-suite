'use client'

import Signature from './signature'
import Thumbnail from './thumbnail'
import Empty from '@/components/empty'

import { useAcademyPaging } from '@/hooks/academy.hook'

export type ShelfProps = {
  pageIds: string[]
  metadata: PageMap
}

export default function Shelf({ pageIds, metadata }: ShelfProps) {
  const { bannerId, thumbnailIds } = useAcademyPaging(pageIds, metadata)

  return (
    <div className="grid grid-cols-12 gap-6 @container">
      {bannerId && (
        <div className="col-span-full">
          <Signature pageId={bannerId} metadata={metadata[bannerId]} />
        </div>
      )}
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
