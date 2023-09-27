'use client'
import { useMemo } from 'react'

import { MintAmount, MintSymbol } from '@/components/mint'
import LaunchpadTimeLine from '../../launchpadCard/launchpadTimeLine'
import Sold from '../../launchpadCard/sold'

import {
  useCalculateMetric,
  useFilterCheques,
  useLaunchpadByAddress,
} from '@/providers/launchpad.provider'
import { undecimalize } from '@/helpers/decimals'
import { useMints } from '@/hooks/spl.hook'
import { numeric } from '@/helpers/utils'
import YourBought from './yourBought'

type TradingInfoProps = {
  launchpadAddress: string
}

export default function TradingInfo({ launchpadAddress }: TradingInfoProps) {
  const cheques = useFilterCheques(launchpadAddress)
  const { totalUsers, totalBid } = useCalculateMetric(cheques)
  const { startTime, startReserves, stableMint } =
    useLaunchpadByAddress(launchpadAddress)
  const isStarted = Date.now() / 1000 > startTime.toNumber()
  const [mintInfo] = useMints([stableMint.toBase58()])

  const decimals = useMemo(() => mintInfo?.decimals || 0, [mintInfo?.decimals])
  const fundraisingRatio = useMemo(() => {
    const totalBidNum = Number(undecimalize(totalBid, decimals || 0))
    const reserveBidNum =
      startReserves && Number(undecimalize(startReserves[1], decimals))
    return totalBidNum / reserveBidNum
  }, [decimals, startReserves, totalBid])

  return (
    <div className="card rounded-3xl p-6 bg-[--accent-card] flex flex-col gap-4 ">
      <YourBought launchpadAddress={launchpadAddress} />
      <div className="flex flex-row items-start justify-between">
        <p className="text-sm opacity-60">Participants</p>
        <p>{totalUsers}</p>
      </div>
      <div className="flex flex-row items-start justify-between">
        <p className="text-sm opacity-60">
          {isStarted ? ' End in' : 'Start in'}
        </p>
        <LaunchpadTimeLine launchpadAddress={launchpadAddress} />
      </div>
      <div className="flex flex-row items-start justify-between">
        <p className="text-sm opacity-60">Sold</p>
        {startReserves && <Sold launchpadAddress={launchpadAddress} />}
      </div>
      <div className="flex flex-row items-start justify-between">
        <p className="text-sm opacity-60">Fundraising goal</p>
        <div className=" flex gap-2 items-baseline ">
          {isStarted && (
            <p>
              <MintAmount
                amount={totalBid}
                mintAddress={stableMint.toBase58()}
                format="0a.[0000]"
              />
            </p>
          )}
          {isStarted && <p>/</p>}
          <p>
            {startReserves && (
              <MintAmount
                mintAddress={stableMint.toBase58()}
                amount={startReserves[0]}
                format="0a.[0000]"
              />
            )}
          </p>
          <p>
            <MintSymbol mintAddress={stableMint.toBase58()} />
          </p>
          {isStarted && (
            <p>({numeric(fundraisingRatio).format('%0,0.[00]')})</p>
          )}
        </div>
      </div>
    </div>
  )
}
