'use client'
import { useCallback, useMemo } from 'react'
import useSWR from 'swr'

import { ArrowDownLeftFromCircle } from 'lucide-react'
import HeroCard from '../heroCard'

import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { usePrices } from '@/providers/mint.provider'
import { useMints } from '@/hooks/spl.hook'
import { useDistributors, useMyReceipts } from '@/providers/airdrop.provider'

const TotalReceived = () => {
  const myReceipts = useMyReceipts()
  const distributors = useDistributors()

  const mintAddresses = useMemo(() => {
    const result: string[] = []
    if (!Object.keys(distributors).length) return result
    for (const address in myReceipts) {
      const { distributor } = myReceipts[address]
      const { mint } = distributors[distributor.toBase58()]
      result.push(mint.toBase58())
    }
    return result
  }, [distributors, myReceipts])

  const mints = useMints(mintAddresses)
  const prices = usePrices(mintAddresses)
  const decimals = mints.map((mint) => mint?.decimals || 0)

  const fetcher = useCallback(async () => {
    if (!prices) return 0
    let total = 0
    let idx = 0
    for (const address in myReceipts) {
      const { amount } = myReceipts[address]
      const numAmount = Number(undecimalize(amount, decimals[idx]))
      total += numAmount * prices[idx]
      idx++
    }
    return total
  }, [prices, myReceipts, decimals])

  const { data: totalUSD, isLoading } = useSWR(
    [mintAddresses, prices, 'totalReceived'],
    fetcher,
  )

  return (
    <HeroCard
      Icon={ArrowDownLeftFromCircle}
      label="Total Received"
      loading={isLoading}
      value={numeric(totalUSD || 0).format('$0,0.[0000]')}
    />
  )
}

export default TotalReceived
