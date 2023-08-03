import Link from 'next/link'
import dayjs from 'dayjs'

export type ThumbnailProps = {
  pageId: string
  metadata: PageMetadata
}

export default async function Banner({
  pageId,
  metadata: { updatedAt, tags, title, description, thumbnail },
}: ThumbnailProps) {
  return (
    <Link
      className="card h-full bg-base-100 rounded-box shadow hover:shadow-lg transition-all grid grid-cols-12 gap-4 overflow-clip @container"
      href={`/academy/${pageId}`}
    >
      <div className="col-span-full @2xl:col-span-6">
        <img className="h-full object-cover" src={thumbnail} alt={pageId} />
      </div>
      <div className="col-span-full @2xl:col-span-6 flex flex-col gap-4 p-8">
        <p className="text-sm opacity-60">
          {dayjs(updatedAt).format('MMM DD, YYYY')}
        </p>
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
