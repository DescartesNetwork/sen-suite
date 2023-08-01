'use client'
import Link from 'next/link'

export type ThumbnailProps = {
  pageId: string
}

export default async function Thumbnail({ pageId }: ThumbnailProps) {
  return (
    <Link
      className="card bg-base-100 rounded-box shadow hover:shadow-xl"
      href={`/academy/${pageId}`}
    >
      <figure>
        <img
          src={
            'https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg'
          }
          alt={pageId}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{pageId}</h2>
      </div>
    </Link>
  )
}
