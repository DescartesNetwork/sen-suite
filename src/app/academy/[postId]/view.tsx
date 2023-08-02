'use client'
import { Fragment } from 'react'
import { ExtendedRecordMap, PageBlock } from 'notion-types'

import { NotionRenderer } from 'react-notion-x'
import { Collection } from 'react-notion-x/build/third-party/collection'
import { Tweet } from 'react-tweet'
import PostHeader from './header'

import { useTheme } from '@/providers/ui.provider'

export function Nothing() {
  return <Fragment />
}

export default function PostView({ map }: { map: ExtendedRecordMap }) {
  const { theme } = useTheme()

  return (
    <div className="grid grid-cols-12 gap-8">
      <NotionRenderer
        recordMap={map}
        fullPage={true}
        darkMode={theme === 'dark'}
        className="col-span-full overflow-clip rounded-3xl"
        components={{
          Header: ({ block }: { block: PageBlock }) => (
            <PostHeader block={block} map={map} />
          ),
          Collection,
          Tweet,
        }}
      />
    </div>
  )
}
