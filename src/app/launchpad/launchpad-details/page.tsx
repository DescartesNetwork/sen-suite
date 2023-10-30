'use client'
import { useRouter, useSearchParams } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'
import BuyToken from './buyToken'
import Information from './information'
import TradingInfo from './tradingInfo'
import NewWindow from '@/components/newWindow'
import Clipboard from '@/components/clipboard'

import { solscan } from '@/helpers/explorers'
import { shortenAddress } from '@/helpers/utils'
import { useLaunchpadByAddress } from '@/providers/launchpad.provider'

export default function LaunchpadDetails() {
  const { push, back } = useRouter()
  const searchParams = useSearchParams()
  const launchpadAddress = searchParams.get('launchpadAddress') || ''
  const { endTime } = useLaunchpadByAddress(launchpadAddress)
  const completed = endTime.toNumber() < Date.now() / 1000

  if (!launchpadAddress) return push('/launchpad')
  return (
    <div className="grid grid-cols-12 w-full gap-6">
      <div className="col-span-full card bg-[--accent-card] rounded-full p-2 flex flex-row items-center gap-2">
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
      <div className="md:col-span-7 col-span-full">
        <Information launchpadAddress={launchpadAddress} />
      </div>
      <div className="flex flex-col md:col-span-5 col-span-full gap-6">
        {!completed && <BuyToken launchpadAddress={launchpadAddress} />}
        <TradingInfo launchpadAddress={launchpadAddress} />
      </div>
    </div>
  )
}
