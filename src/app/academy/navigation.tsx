'use client'
import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'

import { Search } from 'lucide-react'
import Empty from '@/components/empty'
import Modal from '@/components/modal'

import { useAcademyPaging } from '@/hooks/academy.hook'

export const TAGS = {
  Recent: {
    title: '🔥 Recent',
    tag: '',
  },
  LabUpdates: {
    title: 'Lab Updates',
    tag: 'Lab Updates',
  },
  Technology: {
    title: '🧑‍💻 Technology',
    tag: 'Technology',
  },
  Desig101: {
    title: 'Desig 1️⃣ 0️⃣ 1️⃣',
    tag: 'Desig 101',
  },
  Campaigns: {
    title: 'Campaigns',
    tag: 'Campaigns',
  },
  Others: {
    title: 'Others',
    tag: 'Others',
  },
}

export type NavigationProps = {
  pageIds: string[]
  metadata: PageMap
}

export default function Navigation({ pageIds, metadata }: NavigationProps) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const { tag: activeTag, page } = useAcademyPaging(pageIds, metadata)

  const onHref = useCallback(
    (tag: string) =>
      !tag
        ? { pathname: '/academy', query: { page } }
        : { pathname: '/academy', query: { tag, page } },
    [page],
  )

  const results = useMemo(() => {
    console.log(keyword)
    return []
  }, [keyword])

  return (
    <div className="flex flex-row items-center">
      <div className="flex-auto flex flex-row gap-2 overflow-auto no-scrollbar">
        {Object.values(TAGS).map(({ title, tag }) => (
          <Link
            key={tag}
            className={
              'btn rounded-full ' +
              (tag === activeTag ? 'btn-neutral' : 'btn-ghost')
            }
            href={onHref(tag)}
          >
            {title}
          </Link>
        ))}
      </div>
      <button
        className="btn btn-circle btn-ghost"
        onClick={() => setOpen(true)}
      >
        <Search />
      </button>
      <Modal open={open} onCancel={() => setOpen(false)}>
        <div className="grid grid-cols-12 gap-4">
          <h5 className="col-span-full">Search</h5>
          <input
            type="text"
            name="search"
            placeholder="Type something to search"
            className="col-span-full input bg-base-200 rounded-full"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          {!results.length && (
            <div className="col-span-full flex flex-row justify-center p-4">
              <Empty />
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
