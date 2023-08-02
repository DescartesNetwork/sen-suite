'use client'
import { ExtendedRecordMap, PageBlock } from 'notion-types'

import { NotionRenderer } from 'react-notion-x'
import { Tweet } from 'react-tweet'
import PageHeader from './header'
import PageCollection from './collection'

import { useTheme } from '@/providers/ui.provider'

export default function PageContent({ map }: { map: ExtendedRecordMap }) {
  const { theme } = useTheme()

  return (
    <div className="grid grid-cols-12 gap-8">
      <NotionRenderer
        recordMap={map}
        fullPage={true}
        darkMode={theme === 'dark'}
        className="col-span-full overflow-clip rounded-3xl ring-1 ring-base-200"
        components={{
          Header: ({ block }: { block: PageBlock }) => (
            <PageHeader block={block} map={map} />
          ),
          Collection: ({ block }: { block: PageBlock }) => (
            <PageCollection block={block} map={map} />
          ),
          Tweet,
        }}
      />
    </div>
  )
}
