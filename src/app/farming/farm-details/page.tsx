'use client'
import { useRouter, useSearchParams } from 'next/navigation'

import { isAddress } from '@/helpers/utils'

export default function FarmDetails() {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const farmAddress = searchParams.get('farmAddress')

  if (!isAddress(farmAddress)) return push('/farming')
  return <div className="grid grid-cols-12 gap-2">{farmAddress}</div>
}
