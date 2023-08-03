import { BrandLogo } from '@/components/brand'
import Banner from './banner'
import Thumbnail from './thumbnail'

import { getDatabase } from '@/app/api/blogs/[pageId]/service'

export default async function Academy() {
  const {
    pageIds: [bannerPageId, ...pageIds],
    metadata,
  } = await getDatabase()

  return (
    <div className="flex flex-row justify-center rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4">
      <div className="w-full max-w-[1240px]">
        <div className="grid grid-cols-12 gap-4 @container">
          <div className="col-span-full py-8 flex flex-col @xl:flex-row gap-2 items-center justify-center">
            <BrandLogo size={56} />
            <h3 className="text-center">
              <span className="font-thin">Sentre</span> Academy
            </h3>
          </div>
          <div className="col-span-full">
            <Banner pageId={bannerPageId} metadata={metadata[bannerPageId]} />
          </div>
          {pageIds.map((pageId) => (
            <div
              key={pageId}
              className="col-span-full @xl:col-span-6 @4xl:col-span-4"
            >
              <Thumbnail pageId={pageId} metadata={metadata[pageId]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
