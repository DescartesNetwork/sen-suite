'use client'
import Link from 'next/link'
import dayjs from 'dayjs'
import { Pin } from 'lucide-react'

export type SignatureProps = {
  pageId: string
  metadata: PageMetadata
}

export default function Signature({
  pageId,
  metadata: { updatedAt, tags, title, description, thumbnail },
}: SignatureProps) {
  return (
    <Link
      className="card h-full bg-base-100 rounded-box shadow transition-all grid grid-cols-12 gap-4 overflow-clip @container"
      href={`/academy/${pageId}`}
    >
      <div className="col-span-full @2xl:col-span-6">
        <img
          className="h-full w-full object-cover"
          src={thumbnail}
          alt={pageId}
        />
      </div>
      <div className="col-span-full @2xl:col-span-6 flex flex-col gap-4 p-8">
        <div className="flex flex-row gap-2 items-center">
          <p className="flex-auto text-sm opacity-60">
            {dayjs(updatedAt).format('MMM DD, YYYY')}
          </p>
          <Pin className="w-4 h-4" />
        </div>
        <h2 className="card-title">{title}</h2>
        <p className="opacity-60 flex-auto">{description}</p>
        {tags.map((tag) => (
          <div key={tag} className="badge badge-outline">
            {tag}
          </div>
        ))}
      </div>
    </Link>
  )
}