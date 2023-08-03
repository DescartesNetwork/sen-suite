import 'server-only'
import { Client } from '@notionhq/client'
import { NotionAPI } from 'notion-client'
import { getBlockTitle, getPageProperty } from 'notion-utils'
import { v4 as uuid } from 'uuid'

export const getDatabase = async () => {
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  })
  const { results } = await notion.databases.query({
    database_id: '677f0fd492ed4884af268db31eebb0ec',
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  })
  return { pageIds: results.map(({ id }) => id), database: results }
}

export const getPage = async (pageId: string) => {
  const notion = new NotionAPI()
  const map = await notion.getPage(pageId)
  return map
}

export const getPageMetadata = async (pageId: string) => {
  const map = await getPage(pageId)
  const [{ value: block }] = Object.values(map.block)

  const updatedAt = getPageProperty<number>('Date', block, map) || Date.now()
  const tags = getPageProperty<string[]>('Tags', block, map) || []
  const title = getBlockTitle(block, map)
  const description = getPageProperty<string[]>('Description', block, map) || []
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
