'use client'
import { Fragment } from 'react'
import { ExtendedRecordMap } from 'notion-types'

import { NotionRenderer } from 'react-notion-x'

import { useTheme } from '@/providers/ui.provider'
import Island from '@/components/island'

function Nothing() {
  return <Fragment />
}

export default function PostView({ data }: { data: ExtendedRecordMap }) {
  const { theme } = useTheme()
  return (
    <Island>
      <div className="grid grid-cols-12 gap-8">
        <NotionRenderer
          recordMap={data}
          fullPage={true}
          darkMode={theme === 'dark'}
          className="col-span-full overflow-clip rounded-3xl"
          components={{
            Header: Nothing,
          }}
        />
      </div>
    </Island>
  )
}
