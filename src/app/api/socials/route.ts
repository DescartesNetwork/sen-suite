import { NextRequest, NextResponse } from 'next/server'

import {
  getFollowsTwitter,
  getJoinersDiscord,
  getJoinersTelegram,
  getRepoGithub,
  getSubYoutube,
} from './service'

export async function GET(_req: NextRequest) {
  const [subYtb, joinersDis, joinersTele, followersTwt, repoGithub] =
    await Promise.all([
      getSubYoutube(),
      getJoinersDiscord(),
      getJoinersTelegram(),
      getFollowsTwitter(),
      getRepoGithub(),
    ])

  return NextResponse.json({
    subYtb,
    joinersDis,
    joinersTele,
    followersTwt,
    repoGithub,
  })
}
