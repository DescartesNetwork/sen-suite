'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import { ChevronLeft } from 'lucide-react'
import BuyToken from './buyToken'
import Progress from './progress'
import Information from './information'

export default function LaunchpadDetails() {
  const searchParams = useSearchParams()
  const { push } = useRouter()
  const launchpadAddress = searchParams.get('launchpadAddress') || ''

  if (!launchpadAddress) return push('/launchpad')
  return (
    <div className="grid grid-cols-12 w-full gap-6 pt-10">
      <div className="col-span-full">
        <Link href={'/launchpad'} className="btn btn-sm btn-ghost mb-2">
          <ChevronLeft size={16} />
          Back
        </Link>
      </div>
      <div className="md:col-span-6 col-span-12">
        <Information launchpadAddress={launchpadAddress} />
      </div>
      <div className="grid md:col-span-6 col-span-12 gap-6">
        <div>
          <BuyToken launchpadAddress={launchpadAddress} />
        </div>
        <div>
          <Progress launchpadAddress={launchpadAddress} />
        </div>
      </div>
    </div>
  )
}
