'use client'
import Link from 'next/link'
import dayjs from 'dayjs'
import { Pin } from 'lucide-react'

export type LiteProps = {
  pageId: string
  metadata: PageMetadata
}

export default function Lite({
  pageId,
  metadata: { updatedAt, tags, title },
}: LiteProps) {
  return (
    <Link
      className="card card-side h-full bg-base-100 rounded-box shadow"
      href={`/academy/${pageId}`}
    >
      <div className="w-full flex flex-col gap-4 p-6">
        <div className="flex flex-row gap-2 items-center">
          <p className="flex-auto text-sm opacity-60">
            {dayjs(updatedAt).format('MMM DD, YYYY')}
          </p>
          <Pin className="w-4 h-4" />
        </div>
        <p className="flex-auto font-bold">{title}</p>
        {tags.map((tag) => (
          <div key={tag} className="badge badge-sm badge-outline">
            {tag}
          </div>
        ))}
      </div>
    </Link>
  )
}
