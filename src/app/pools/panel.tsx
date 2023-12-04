'use client'
import { useCallback, useMemo } from 'react'
import BN from 'bn.js'
import useSWR from 'swr'
import axios from 'axios'
import classNames from 'classnames'

import { usePools } from '@/providers/pools.provider'
import { useTvl } from '@/hooks/tvl.hook'
import { numeric } from '@/helpers/utils'
import { DateHelper } from '@/helpers/date'
import solConfig from '@/configs/sol.config'

export default function LiquidityPoolPanel() {
  const pools = usePools()
  const poolAddresses = useMemo(() => Object.keys(pools), [pools])

  // TVL
  const mintAddressToAmount = useMemo(() => {
    const result: Record<string, { mintAddress: string; amount: BN }> = {}

    for (const address in pools) {
      const { reserves, mints } = pools[address]
      mints.forEach((mint, i) => {
        if (result[mint.toBase58()]) {
          result[mint.toBase58()].amount = result[mint.toBase58()].amount.add(
            reserves[i],
          )
          return
        }
        result[mint.toBase58()] = {
          amount: reserves[i],
          mintAddress: mint.toBase58(),
        }
      })
    }
    return Object.values(result)
  }, [pools])

  const tvl = useTvl(mintAddressToAmount)

  const fetcher = useCallback(
    async ([poolAddresses]: [string[]]) => {
      const dateRange = 7
      const programId = solConfig.balancerAddress
      const today = new DateHelper()
      const yesterday = today.subtractDay(1)
      const hour = new Date().getHours()
      let total = 0

      for (const poolAddress of poolAddresses) {
        const { treasuries } = pools[poolAddress]
        const tokenAccounts = treasuries.map((treasury) => treasury.toBase58())
        const { data } = await axios.get(solConfig.statRpc + 'stat/volume', {
          params: {
            ymdTo: today.ymd(),
            ymdFrom: today.subtractDay(dateRange).ymd(),
            tokenAccounts,
            programId,
          },
        })

        const { volumes } = data
        total += volumes[today.ymd()] + (hour * volumes[yesterday.ymd()]) / 24
      }
      return total
    },
    [pools],
  )

  const { data: totalVol, isLoading } = useSWR(
    [poolAddresses, 'totalVol'],
    fetcher,
  )

  return (
    <div className="card w-full shadow-lg p-8 ring-1 ring-base-100 bg-gradient-to-br from-cyan-200 to-indigo-300 flex flex-row-reverse flex-wrap gap-x-2 gap-y-16 justify-center">
      <div className="w-48 relative -mb-4">
        <img
          className="w-full"
          src="/farming-illustration.png"
          alt="farming-illustration"
        />
        <img
          className="absolute -top-6 left-4 animate-bounce"
          src="/farming-coin-1.svg"
          alt="farming-coin-1"
        />
        <img
          style={{ animationDelay: '150ms' }}
          className="absolute -top-12 right-2 animate-bounce"
          src="/farming-coin-2.svg"
          alt="farming-coin-2"
        />
      </div>
      <div className="flex-auto flex flex-col gap-8 text-slate-800">
        <div className="flex flex-row gap-2">
          <h4>Liquidity Pools</h4>
          <h5 className="opacity-60">SenSwap</h5>
        </div>
        <div className="flex flex-row gap-2">
          <div className="">
            <p className="text-sm">TVL</p>
            <h5>{numeric(tvl).format('$0,0.[00]')}</h5>
          </div>
          <span className="divider divider-horizontal m-0" />
          <div className="">
            <p className="text-sm">Total volume 24h</p>
            <h5
              className={classNames({
                'loading loading-spinner loading-xs': isLoading,
              })}
            >
              {numeric(totalVol).format('$0,0.[00]')}
            </h5>
          </div>
        </div>
      </div>
    </div>
  )
}
