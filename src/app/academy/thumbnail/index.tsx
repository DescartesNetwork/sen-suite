import Link from 'next/link'
import { getBlockTitle, getPageProperty } from 'notion-utils'
import dayjs from 'dayjs'

import { getPage } from '../utils'

export type ThumbnailProps = {
  pageId: string
}

export default async function Thumbnail({ pageId }: ThumbnailProps) {
  const map = await getPage(pageId)
  const [{ value: block }] = Object.values(map.block)

  const imgs = ['https://placehold.co/600x400']
  const updatedAt = getPageProperty<number>('Date', block, map) || Date.now()
  const tags = getPageProperty<string[]>('Tags', block, map) || []
  const title = getBlockTitle(block, map)
  const description = getPageProperty<string[]>('Description', block, map) || []

  return (
    <Link
      className="card h-full bg-base-100 rounded-box shadow hover:shadow-xl"
      href={`/academy/${pageId}`}
    >
      <figure>
        <img src={imgs[0]} alt={pageId} />
      </figure>
      <div className="card-body">
        <p className="text-sm opacity-60">
          {dayjs(updatedAt).format('MMM DD, YYYY')}
        </p>
        <h2 className="card-title">{title}</h2>
        <p className="opacity-60">{description}</p>
        {tags.map((tag) => (
          <div key={tag} className="badge badge-outline">
            {tag}
          </div>
        ))}
      </div>
    </Link>
  )
}
