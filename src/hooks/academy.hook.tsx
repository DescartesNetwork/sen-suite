import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import useSWR from 'swr'
import { ExtendedRecordMap } from 'notion-types'
import axios from 'axios'

const LIMIT = 9

export const useAcademyPaging = (pageIds: string[], metadata: PageMap) => {
  const params = useSearchParams()
  const tag = params.get('tag') || ''
  const page = Number(params.get('page')) || 1
  const availableIds = useMemo(
    () =>
      pageIds.filter((pageId) => {
        const { publishedAt } = metadata[pageId]
        return publishedAt < Date.now()
      }),
    [pageIds, metadata],
  )

  const pinnedIds = useMemo(() => {
    return availableIds.filter((pageId) => {
      const { pinned } = metadata[pageId]
      return pinned
    })
  }, [availableIds, metadata])

  const taggedIds = useMemo(
    () =>
      availableIds.filter((pageId) => {
        if (!tag) return true
        if (metadata[pageId].tags.includes(tag)) return true
        return false
      }),
    [availableIds, tag, metadata],
  )
  const total = useMemo(() => taggedIds.length, [taggedIds])
  const thumbnailIds = useMemo(() => {
    return taggedIds.slice((page - 1) * LIMIT, Math.min(page * LIMIT, total))
  }, [taggedIds, page, total])

  return {
    tag,
    page,
    total,
    limit: LIMIT,
    pinnedIds,
    thumbnailIds,
  }
}

export const useAcademyPage = (
  pageId: string,
): {
  data: Partial<{
    map: ExtendedRecordMap
    recommends: string[]
    metadata: PageMetadata
  }>
  error: Error | undefined
} => {
  const { data, error } = useSWR<
    { map: ExtendedRecordMap; recommends: string[] },
    Error
  >([pageId, 'blog'], async ([pageId]: [string]) => {
    const { data } = await axios.get(`/api/blogs/${pageId}`)
    return data
  })

  return { data: data || {}, error }
}
