'use client'
import { useMemo } from 'react'
import classNames from 'classnames'

import { MintAmount, MintSymbol } from '@/components/mint'

import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { useMints } from '@/hooks/spl.hook'
import {
  useCalculateMetric,
  useFilterCheques,
  useLaunchpadByAddress,
} from '@/providers/launchpad.provider'

type FundraisingProps = {
  launchpadAddress: string
  direction?: 'row' | 'col'
  showProgress?: boolean
}
export default function Fundraising({
  launchpadAddress,
  direction = 'row',
  showProgress = true,
}: FundraisingProps) {
  const { stableMint, startReserves, startTime } =
    useLaunchpadByAddress(launchpadAddress)
  const cheques = useFilterCheques(launchpadAddress)
  const { totalBid } = useCalculateMetric(cheques)
  const [mintInfo] = useMints([stableMint.toBase58()])
  const decimals = useMemo(() => mintInfo?.decimals || 0, [mintInfo?.decimals])

  const fundraisingRatio = useMemo(() => {
    const totalBidNum = Number(undecimalize(totalBid, decimals || 0))
    const reserveBidNum = Number(undecimalize(startReserves[1], decimals))
    return totalBidNum / reserveBidNum
  }, [decimals, startReserves, totalBid])

  const isStarted = Date.now() / 1000 > startTime.toNumber()

  return (
    <div className="grid grid-cols-12 gap-2">
      <div
        className={classNames(
          'col-span-full gap-3 flex justify-between flex-row',
          {
            'md:flex-col': direction === 'col',
            'md:flex-row': direction === 'row',
          },
        )}
      >
        <p className="opacity-60 text-sm">Fundraising</p>
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
            <MintAmount
              mintAddress={stableMint.toBase58()}
              amount={startReserves[0]}
              format="0a.[0000]"
            />
          </p>
          <p>
            <MintSymbol mintAddress={stableMint.toBase58()} />
          </p>
          {isStarted && (
            <p>({numeric(fundraisingRatio).format('%0,0.[00]')})</p>
          )}
        </div>
      </div>

      {showProgress && (
        <div className="col-span-full">
          <progress
            className="progress progress-primary w-full"
            value={fundraisingRatio * 100}
            max="100"
          />
        </div>
      )}
    </div>
  )
}
