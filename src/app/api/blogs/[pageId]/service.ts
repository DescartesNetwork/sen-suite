import { NotionAPI } from 'notion-client'
import { ExtendedRecordMap } from 'notion-types'

import deplConfig from '@/configs/depl.config'
import { extractProperties } from './utils'

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
    const page = extractProperties(value, map, pageId)
    metadata[pageId] = page
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
  const [{ value }] = Object.values(map.block)
  const page = extractProperties(value, map)
  return page
}
