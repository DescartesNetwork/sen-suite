import { NextResponse } from 'next/server'
import { getDatabase } from './service'

export async function GET() {
  const { pageIds } = await getDatabase()

  return NextResponse.json({ data: pageIds })
}
