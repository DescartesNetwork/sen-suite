'use client'
import { useMemo } from 'react'

import { MintAmount, MintSymbol } from '@/components/mint'

import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { useMints } from '@/hooks/spl.hook'
import {
  useCalculateMetric,
  useFilterCheques,
  useLaunchpadByAddress,
} from '@/providers/launchpad.provider'

type SoldProps = {
  launchpadAddress: string
}
export default function Sold({ launchpadAddress }: SoldProps) {
  const cheques = useFilterCheques(launchpadAddress)
  const { startReserves, mint, startTime } =
    useLaunchpadByAddress(launchpadAddress)
  const { totalAsk } = useCalculateMetric(cheques)
  const [mintInfo] = useMints([mint.toBase58()])
  const decimals = useMemo(() => mintInfo?.decimals || 0, [mintInfo?.decimals])

  const soldRatio = useMemo(() => {
    const totalAskNum = Number(undecimalize(totalAsk, decimals || 0))
    const reserveAskNum = Number(undecimalize(startReserves[0], decimals))
    return totalAskNum / reserveAskNum
  }, [decimals, startReserves, totalAsk])

  const isStarted = Date.now() / 1000 > startTime.toNumber()

  return (
    <div className="flex gap-2 items-center">
      {isStarted && (
        <p>
          <MintAmount amount={totalAsk} mintAddress={mint.toBase58()} /> /
        </p>
      )}
      <p>
        <MintAmount mintAddress={mint.toBase58()} amount={startReserves[0]} />
      </p>
      <p>
        <MintSymbol mintAddress={mint.toBase58()} />
      </p>
      {isStarted && <p>({numeric(soldRatio).format('%0,0.[00]')})</p>}
    </div>
  )
}
