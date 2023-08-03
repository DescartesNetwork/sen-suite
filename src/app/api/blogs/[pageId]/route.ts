import { NextRequest, NextResponse } from 'next/server'
import { getPageMap } from './service'

export async function GET(
  _req: NextRequest,
  { params: { pageId } }: { params: { pageId: string } },
) {
  const map = await getPageMap(pageId)

  return NextResponse.json(map)
}
