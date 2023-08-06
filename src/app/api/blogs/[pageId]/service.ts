import { NotionAPI } from 'notion-client'
import { getBlockTitle, getPageImageUrls, getPageProperty } from 'notion-utils'
import { ExtendedRecordMap } from 'notion-types'

import deplConfig from '@/configs/depl.config'

const normalizeImageUrl = (url: string, id: string) => {
  if (!/^https?:\/\//.test(url)) url = `https://www.notion.so${url}`
  return `https://www.notion.so/image/${encodeURIComponent(
    url,
  )}?table=block&id=${id}&cache=v2`
}

export const getDatabase = async () => {
  const api = new NotionAPI()
  const map = await api.getPage(deplConfig.notionDatabaseId)
  const block = { ...map.block }
  Object.keys(block).forEach((pageId) => {
    const {
      value: { type, parent_table },
    } = block[pageId]
    if (type !== 'page' || parent_table !== 'collection') delete block[pageId]
  })
  const pageIds = Object.keys(block).sort((prevPageId, nextPageId) => {
    const {
      value: { created_time: prevCreatedTime },
    } = block[prevPageId]
    const {
      value: { created_time: nextCreatedTime },
    } = block[nextPageId]
    if (prevCreatedTime < nextCreatedTime) return 1
    else if (prevCreatedTime > nextCreatedTime) return -1
    else return 0
  })

  const metadata: PageMap = {}
  pageIds.forEach((pageId) => {
    const { value } = block[pageId]
    const title = getBlockTitle(value, map)
    const updatedAt = getPageProperty<number>('Date', value, map) || Date.now()
    const tags = getPageProperty<string[]>('Tags', value, map) || []
    const description = getPageProperty<string>('Description', value, map) || ''
    const [thumbnail] = getPageImageUrls(map, {
      mapImageUrl: (url, { id }) => {
        if (id !== pageId) return null
        return normalizeImageUrl(url, id)
      },
    })
    metadata[pageId] = {
      title,
      updatedAt,
      tags,
      description,
      thumbnail: thumbnail || 'https://placehold.co/600x400',
    }
  })

  return { pageIds, metadata }
}

export const getPageMap = async (pageId: string) => {
  const notion = new NotionAPI()
  const map = await notion.getPage(pageId)
  return map
}

export const getRecommends = async (pageId: string) => {
  const { pageIds, metadata } = await getDatabase()
  const { tags } = metadata[pageId]

  const recommends: string[] = []
  for (const tag of tags) {
    for (const _pageId of pageIds) {
      const { tags: _tags } = metadata[_pageId]
      if (_pageId === pageId) continue
      if (recommends.includes(_pageId)) continue
      if (_tags.includes(tag)) recommends.push(_pageId)
      if (recommends.length >= 4) return recommends
    }
  }
  return recommends
}

export const getPageMetadata = (map: ExtendedRecordMap) => {
  const [{ value: block }] = Object.values(map.block)

  const updatedAt = getPageProperty<number>('Date', block, map) || Date.now()
  const tags = getPageProperty<string[]>('Tags', block, map) || []
  const title = getBlockTitle(block, map)
  const description = getPageProperty<string>('Description', block, map) || ''
  const [thumbnail] = getPageImageUrls(map, {
    mapImageUrl: (url, { id }) => normalizeImageUrl(url, id),
  })

  return {
    updatedAt,
    tags,
    title,
    description,
    thumbnail: thumbnail || 'https://placehold.co/600x400',
  }
}
