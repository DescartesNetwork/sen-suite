'use client'
import { useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'

import { useBulkSenderData } from '@/providers/bulkSender.provider'

export default function BulkSenderHeader() {
  const pathname = usePathname()
  const { push } = useRouter()
  const { setData } = useBulkSenderData()

  const onBack = useCallback(() => {
    const hops = pathname.split('/')
    hops.pop()
    setData([])
    return push(hops.join('/'))
  }, [push, pathname, setData])

  return (
    <div className="flex flex-row gap-2 items-center">
      {/* <button className="btn btn-sm btn-circle" onClick={onBack}>
        <ChevronLeft />
      </button>
      <h5>Bulk Sender</h5> */}
      <button className="btn btn-sm btn-ghost mb-2" onClick={onBack}>
        <ArrowLeft size={16} />
        Back
      </button>
    </div>
  )
}
