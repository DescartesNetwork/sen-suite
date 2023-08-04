import 'server-only'
import { NotionAPI } from 'notion-client'
import { getBlockTitle, getPageImageUrls, getPageProperty } from 'notion-utils'
import { v4 as uuid } from 'uuid'
import { ExtendedRecordMap } from 'notion-types'

export const getDatabase = async () => {
  const api = new NotionAPI()
  const map = await api.getPage(process.env.NOTION_DATABASE_ID as string)
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
        if (!/^https?:\/\//.test(url)) url = `https://www.notion.so${url}`
        return `https://www.notion.so/image/${encodeURIComponent(
          url,
        )}?table=block&id=${id}&cache=v2`
      },
    })
    metadata[pageId] = { title, updatedAt, tags, description, thumbnail }
  })

  return { pageIds, metadata }
}

export const getPageMap = async (pageId: string) => {
  const notion = new NotionAPI()
  const map = await notion.getPage(pageId)
  return map
}

export const getPageMetadata = async (map: ExtendedRecordMap) => {
  const [{ value: block }] = Object.values(map.block)

  const updatedAt = getPageProperty<number>('Date', block, map) || Date.now()
  const tags = getPageProperty<string[]>('Tags', block, map) || []
  const title = getBlockTitle(block, map)
  const description = getPageProperty<string>('Description', block, map) || ''
  const filename =
    getPageProperty<string>('Files & media', block, map) || uuid()
  const thumbnail =
    Object.values(map.signed_urls)[1] ||
    Object.values(map.signed_urls).find((url) =>
      url.includes(`/${filename}`),
    ) ||
    'https://placehold.co/600x400'

  return {
    updatedAt,
    tags,
    title,
    description,
    thumbnail,
  }
}
