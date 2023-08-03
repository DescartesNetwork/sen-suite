import { NextRequest, NextResponse } from 'next/server'
import { getPageMap, getPageMetadata } from './service'

export async function GET(
  _req: NextRequest,
  { params: { pageId } }: { params: { pageId: string } },
) {
  const map = await getPageMap(pageId)
  const metadata = await getPageMetadata(map)

  return NextResponse.json({ map, metadata })
}
