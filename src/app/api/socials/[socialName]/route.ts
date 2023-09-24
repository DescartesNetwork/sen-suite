import { NextRequest, NextResponse } from 'next/server'

import { getInteractSocials } from './service'

export async function GET(
  _req: NextRequest,
  { params: { socialName } }: { params: { socialName: string } },
) {
  const totalInteraction = await getInteractSocials(socialName)

  return NextResponse.json({ totalInteraction })
}
