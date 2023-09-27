'use client'
import { useRouter, useSearchParams } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'
import BuyToken from './buyToken'
import PeriodToken from './periodToken'
import Information from './information'
import NewWindow from '@/components/newWindow'
import Clipboard from '@/components/clipboard'

import { solscan } from '@/helpers/explorers'
import { shortenAddress } from '@/helpers/utils'

export default function LaunchpadDetails() {
  const { push, back } = useRouter()
  const searchParams = useSearchParams()
  const launchpadAddress = searchParams.get('launchpadAddress') || ''

  if (!launchpadAddress) return push('/launchpad')
  return (
    <div className="grid grid-cols-12 w-full gap-6">
      <div className="col-span-full card bg-base-100 rounded-full p-2 flex flex-row items-center gap-2">
        <div className="flex-auto">
          <button className="btn btn-sm rounded-full" onClick={back}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
        <span className="tooltip" data-tip="Launchpad Address">
          <p className="font-sm font-bold opacity-60 cursor-pointer">
            {shortenAddress(launchpadAddress || '')}
          </p>
        </span>
        <Clipboard
          content={launchpadAddress || ''}
          className="btn btn-sm btn-circle"
        />
        <NewWindow
          href={solscan(launchpadAddress || '')}
          className="btn btn-sm btn-circle"
        />
      </div>

      <div className="md:col-span-7 col-span-12">
        <Information launchpadAddress={launchpadAddress} />
      </div>
      <div className="grid grid-rows-2 md:col-span-5 col-span-12 gap-6">
        <div className="col-span-full">
          <BuyToken launchpadAddress={launchpadAddress} />
        </div>
        <div className="col-span-full">
          <PeriodToken launchpadAddress={launchpadAddress} />
        </div>
      </div>
    </div>
  )
}
