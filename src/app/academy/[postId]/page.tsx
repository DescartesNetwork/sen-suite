import PostView from './view'

import { getPage } from '../utils'

export default async function Post({
  params: { postId },
}: {
  params: { postId: string }
}) {
  const map = await getPage(postId)

  return <PostView map={map} />
}
