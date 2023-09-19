'use client'
import Fundraising from './fundraising'
import ProjectProfile from './projectProfile'

import { useTokenPrice } from '@/hooks/launchpad.hook'
import { numeric } from '@/helpers/utils'
import {
  useCalculateMetric,
  useFilterCheques,
} from '@/providers/launchpad.provider'

type CompletedCardProps = {
  launchpadAddress: string
}
export default function CompletedCard({
  launchpadAddress,
}: CompletedCardProps) {
  const price = useTokenPrice(launchpadAddress)
  const cheques = useFilterCheques(launchpadAddress)
  const { totalUsers } = useCalculateMetric(cheques)

  return (
    <div className="grid grid-cols-12 gap-4 card bg-base-100 p-6 rounded-3xl cursor-pointer border border-base-100 hover:border-[#63E0B3]">
      <div className="col-span-full md:col-span-5">
        <ProjectProfile launchpadAddress={launchpadAddress} />
      </div>
      <div className="col-span-full flex md:col-span-2 md:flex-col gap-3 ">
        <p className="opacity-60 text-sm">Participants</p>
        <p>{totalUsers}</p>
      </div>
      <div className="col-span-full flex md:col-span-2 md:flex-col gap-3 ">
        <p className="opacity-60 text-sm">Price</p>
        <p>{numeric(price).format('$0a.[0000]')}</p>
      </div>
      <div className="col-span-full md:col-span-3">
        <Fundraising
          direction="col"
          launchpadAddress={launchpadAddress}
          showProgress={false}
        />
      </div>
    </div>
  )
}
