'use client'
import { useRouter } from 'next/navigation'

import { ChevronLeft } from 'lucide-react'

export default function BulkSenderHeader() {
  const { back } = useRouter()

  return (
    <div className="flex flex-row gap-2 items-center">
      <button className="btn btn-sm btn-circle" onClick={back}>
        <ChevronLeft />
      </button>
      <h5 className="">Bulk Sender</h5>
    </div>
  )
}
