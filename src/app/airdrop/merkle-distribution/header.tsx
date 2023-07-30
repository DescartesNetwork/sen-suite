'use client'
import { usePathname, useRouter } from 'next/navigation'

import { ChevronLeft } from 'lucide-react'
import { useCallback } from 'react'

export default function MerkleDistributionHeader() {
  const pathname = usePathname()
  const { push } = useRouter()

  const onBack = useCallback(() => {
    const hops = pathname.split('/')
    hops.pop()
    return push(hops.join('/'))
  }, [push, pathname])

  return (
    <div className="flex flex-row gap-2 items-center">
      <button className="btn btn-sm btn-circle" onClick={onBack}>
        <ChevronLeft />
      </button>
      <h5>Merkle Distribution</h5>
    </div>
  )
}
