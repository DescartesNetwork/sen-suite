import Banner from './banner'
import Navigation from './navigation'
import Pagination from './pagination'
import Shelf from './shelf'

import { getDatabase } from '@/app/api/blogs/[pageId]/service'

export default async function Academy() {
  const { pageIds, metadata } = await getDatabase()

  return (
    <div className="flex flex-row justify-center rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4">
      <div className="w-full max-w-[1240px]">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-full py-24">
            <Banner />
          </div>
          <div className="col-span-full">
            <Navigation pageIds={pageIds} metadata={metadata} />
          </div>
          <div className="col-span-full">
            <Shelf pageIds={pageIds} metadata={metadata} />
          </div>
          <div className="col-span-full flex flex-row justify-center mt-8">
            <Pagination pageIds={pageIds} metadata={metadata} />
          </div>
        </div>
      </div>
    </div>
  )
}
