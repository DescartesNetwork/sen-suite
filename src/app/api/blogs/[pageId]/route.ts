import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, getPageMap } from './service'

export async function GET(
  _req: NextRequest,
  { params: { pageId } }: { params: { pageId: string } },
) {
  const map = await getPageMap(pageId)

  return NextResponse.json(map)
}

export async function generateStaticParams() {
  const { pageIds } = await getDatabase()
  const params = pageIds.map((pageId) => ({ pageId }))
  return params
}
