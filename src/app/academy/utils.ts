import 'server-only'
import { Client } from '@notionhq/client'
import { NotionAPI } from 'notion-client'

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
  return results.map(({ id }) => id)
}

export const getPage = async (pageId: string) => {
  const notion = new NotionAPI()
  const map = await notion.getPage(pageId)
  return map
}
