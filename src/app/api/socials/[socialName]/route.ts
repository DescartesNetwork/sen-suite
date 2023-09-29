import { NextRequest, NextResponse } from 'next/server'

import { getNumInteractSocials } from './service'

export async function GET(
  _req: NextRequest,
  { params: { socialName } }: { params: { socialName: string } },
) {
  const numInteraction = await getNumInteractSocials(socialName)

  return NextResponse.json({ numInteraction })
}
