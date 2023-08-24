'use client'
import { useRouter } from 'next/navigation'

import { ChevronLeft } from 'lucide-react'

export default function BulkSenderBack() {
  const router = useRouter()

  return (
    <button className="btn btn-sm btn-ghost mb-2" onClick={() => router.back()}>
      <ChevronLeft size={16} />
      Back
    </button>
  )
}
