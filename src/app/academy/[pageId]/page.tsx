'use client'
import { useEffect } from 'react'
import useSWR from 'swr'
import axios from 'axios'
import { ExtendedRecordMap, PageBlock } from 'notion-types'
import { useRouter } from 'next/navigation'

import { NotionRenderer } from 'react-notion-x'
import { Tweet } from 'react-tweet'
import Skeleton from './skeleton'
import PageHeader from './header'
import PageCollection from './collection'

import { usePushMessage } from '@/components/message/store'
import { useTheme } from '@/providers/ui.provider'

export default function Page({
  params: { pageId },
}: {
  params: { pageId: string }
}) {
  const { push } = useRouter()
  const { theme } = useTheme()
  const pushMessage = usePushMessage()

  const { data: map, error } = useSWR<ExtendedRecordMap, Error>(
    [pageId, 'blog'],
    async ([pageId]: [string]) => {
      const { data } = await axios.get(`/api/blogs/${pageId}`)
      return data
    },
  )

  useEffect(() => {
    if (error) {
      pushMessage('alert-error', error.message)
      push('/academy')
    }
  }, [error, pushMessage, push])

  if (!map) return <Skeleton />
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
