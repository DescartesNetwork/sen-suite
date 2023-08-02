import PageContent from './content'

import { getPage } from '../utils'

export default async function Page({
  params: { pageId },
}: {
  params: { pageId: string }
}) {
  const map = await getPage(pageId)

  return <PageContent map={map} />
}
