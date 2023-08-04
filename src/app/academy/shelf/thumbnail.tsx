'use client'
import Link from 'next/link'
import dayjs from 'dayjs'

export type ThumbnailProps = {
  pageId: string
  metadata: PageMetadata
}

export default function Thumbnail({
  pageId,
  metadata: { updatedAt, tags, title, description, thumbnail },
}: ThumbnailProps) {
  return (
    <Link
      className="card h-full bg-base-100 rounded-box"
      href={`/academy/${pageId}`}
    >
      <figure>
        <img src={thumbnail} alt={pageId} />
      </figure>
      <div className="card-body">
        <p className="text-sm opacity-60">
          {dayjs(updatedAt).format('MMM DD, YYYY')}
        </p>
        <h2 className="card-title">{title}</h2>
        <p className="opacity-60 pb-4">{description}</p>
        {tags.map((tag) => (
          <div key={tag} className="badge badge-outline">
            {tag}
          </div>
        ))}
      </div>
    </Link>
  )
}
