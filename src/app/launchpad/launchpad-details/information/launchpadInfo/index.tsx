'use client'

import { InfoIcon } from 'lucide-react'
import ProjectProfile from '@/app/launchpad/launchpadCard/projectProfile'
import LaunchpadLineChart from '@/app/launchpad/lineChart.tsx'

import { numeric } from '@/helpers/utils'
import { useAVGPrice, useTokenPrice } from '@/hooks/launchpad.hook'
import History from './history'

type LaunchpadInfoProps = {
  launchpadAddress: string
}
export default function LaunchpadInfo({
  launchpadAddress,
}: LaunchpadInfoProps) {
  const mintPrice = useTokenPrice(launchpadAddress)
  const avgPrice = useAVGPrice(launchpadAddress)

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full">
        <ProjectProfile launchpadAddress={launchpadAddress} />
      </div>
      <div className="col-span-full card p-4 bg-base-100 grid grid-cols-12 gap-2">
        <div className="col-span-6 flex flex-col gap-2">
          <p className="opacity-60 text-sm">Token price</p>
          <h5>${numeric(mintPrice).format('0,0.[000]')}</h5>
        </div>
        <div className="col-span-6 flex flex-col gap-2">
          <div
            className="tooltip"
            data-tip="This price is based on the average of all purchased users."
          >
            <p className="opacity-60 text-sm flex gap-2 items-center cursor-pointer">
              Avg. purchase price <InfoIcon size={16} />
            </p>
          </div>
          <h5>${numeric(avgPrice).format('0,0.[000]')}</h5>
        </div>
      </div>
      <div className="col-span-full">
        <LaunchpadLineChart launchpadAddress={launchpadAddress} />
      </div>
      <div className="col-span-full">
        <History />
      </div>
    </div>
  )
}
