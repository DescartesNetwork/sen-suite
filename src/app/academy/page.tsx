import Thumbnail from './thumbnail'

import { getDatabase } from './utils'

export default async function Academy() {
  const { pageIds } = await getDatabase()

  return (
    <div className="flex flex-row justify-center rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4">
      <div className="w-full max-w-[1240px]">
        <div className="grid grid-cols-12 gap-4 @container">
          <h2 className="col-span-full text-center py-8">Sentre Academy</h2>
          {pageIds.map((pageId) => (
            <div
              key={pageId}
              className="col-span-full @xl:col-span-6 @4xl:col-span-4"
            >
              <Thumbnail pageId={pageId} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
