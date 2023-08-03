import 'server-only'
import { NotionAPI } from 'notion-client'
import { getBlockTitle, getPageImageUrls, getPageProperty } from 'notion-utils'

export const getDatabase = async () => {
  const api = new NotionAPI()
  const map = await api.getPage('677f0fd492ed4884af268db31eebb0ec')
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
        return `https://www.notion.so/image/${encodeURIComponent(
          url,
        )}?table=block&id=${id}&cache=v2`
      },
    })
    metadata[pageId] = { title, updatedAt, tags, description, thumbnail }
  })

  return { pageIds, metadata }
}
