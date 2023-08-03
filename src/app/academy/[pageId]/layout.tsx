import { ReactNode } from 'react'

import { getDatabase } from '@/app/api/blogs/service'

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-full">{children}</div>
    </div>
  )
}

export async function generateStaticParams() {
  const { pageIds } = await getDatabase()
  const params = pageIds.map((pageId) => ({ pageId }))
  return params
}
