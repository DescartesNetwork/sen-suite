'use client'
import { useMemo } from 'react'
import Link from 'next/link'

import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'

import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { useOracles } from '@/hooks/pool.hook'
import { useMints } from '@/hooks/spl.hook'
import { usePrices } from '@/providers/mint.provider'
import { usePoolByAddress } from '@/providers/pools.provider'

export default function PoolOverview({ poolAddress }: { poolAddress: string }) {
  const pool = usePoolByAddress(poolAddress)
  const mintAddresses = pool.mints.map((mint) => mint.toBase58())
  const prices = usePrices(mintAddresses)
  const mints = useMints(mintAddresses)
  const decimals = mints.map((mint) => mint?.decimals || 0)
  const { getMintInfo } = useOracles()

  const { poolMintInfos, totalValue } = useMemo(() => {
    if (!prices) return { poolMintInfos: [], totalValue: 0 }
    let totalValue = 0
    const poolMintInfos = pool.mints.map((mint, index) => {
      const mintAddress = mint.toBase58()
      const mintInfo = getMintInfo(pool, mint)
      const mintAmount = undecimalize(pool.reserves[index], decimals[index])
      const mintValue = Number(mintAmount) * (prices[index] || 0)
      totalValue += mintValue
      return {
        mintAddress,
        weight: mintInfo.normalizedWeight,
        amount: pool.reserves[index],
        value: mintValue,
      }
    })
    return { poolMintInfos, totalValue }
  }, [decimals, getMintInfo, pool, prices])

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-full overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>TOKEN</th>
              <th>WEIGHT</th>
              <th>AMOUNT</th>
              <th>VALUE</th>
            </tr>
          </thead>
          <tbody>
            {poolMintInfos.map(({ mintAddress, weight, amount, value }) => (
              <tr className="hover" key={mintAddress}>
                <td>
                  <div className="flex gap-2 items-center">
                    <MintLogo
                      className="w-6 h-6 rounded-full"
                      mintAddress={mintAddress}
                    />
                    <MintSymbol mintAddress={mintAddress} />
                  </div>
                </td>
                <td>{numeric(weight).format('0,0.[0000]%')}</td>
                <td>
                  <MintAmount amount={amount} mintAddress={mintAddress} />
                </td>
                <td>{numeric(value).format('$0,0.[0000]')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="col-span-full card bg-base-200 rounded-3xl p-4 flex flex-row items-center justify-between">
        <p className="text-sm opacity-60">Total value</p>
        <h5>{numeric(totalValue).format('$0,0.[0000]')}</h5>
      </div>
      <Link
        className="col-span-full btn btn-primary"
        href={`/pool-details?poolAddress=${poolAddress}`}
      >
        To the pool
      </Link>
    </div>
  )
}
