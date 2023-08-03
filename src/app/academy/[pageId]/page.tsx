import PageContent from './content'

import { getPageMap } from '@/app/api/blogs/[pageId]/service'

export default async function Page({
  params: { pageId },
}: {
  params: { pageId: string }
}) {
  const map = await getPageMap(pageId)

  return <PageContent map={map} />
}
