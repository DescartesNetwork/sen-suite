import 'server-only'
import { NotionAPI } from 'notion-client'
import { getBlockTitle, getPageProperty } from 'notion-utils'
import { v4 as uuid } from 'uuid'
import { ExtendedRecordMap } from 'notion-types'

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
