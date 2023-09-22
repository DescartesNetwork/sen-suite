import { NextRequest, NextResponse } from 'next/server'

import {
  getFollowsTwitter,
  getJoinersDiscord,
  getJoinersTelegram,
  getResGithub,
  getSubYoutube,
} from './service'

export async function GET(_req: NextRequest) {
  const [subYtb, joinersDis, joinersTele, followersTwt, repoGithub] =
    await Promise.all([
      getSubYoutube(),
      getJoinersDiscord(),
      getJoinersTelegram(),
      getFollowsTwitter(),
      getResGithub(),
    ])

  return NextResponse.json({
    subYtb,
    joinersDis,
    joinersTele,
    followersTwt,
    repoGithub,
  })
}
