import { useMemo } from 'react'

import DoughnutChart from './doughnutChart'

import { usePoolByAddress } from '@/providers/pools.provider'
import { undecimalize } from '@/helpers/decimals'
import { useOracles } from '@/hooks/pool.hook'
import { useMintStore } from '@/providers/mint.provider'

const PoolWeights = ({ poolAddress }: { poolAddress: string }) => {
  const poolData = usePoolByAddress(poolAddress)
  const { getMintInfo } = useOracles()
  const metadata = useMintStore(({ metadata }) => metadata)

  const poolWeights = useMemo(() => {
    if (!poolData) return []
    const newData = poolData.mints.map((mint) => {
      const { normalizedWeight, reserve } = getMintInfo(poolData, mint)
      const { decimals, symbol } = metadata.find(
        ({ address }) => mint.toBase58() === address,
      ) || { decimals: 0, symbol: mint.toBase58().substring(0, 4) }

      return {
        symbol,
        tokenAmount: undecimalize(reserve, decimals) || '0',
        weight: normalizedWeight * 100,
      }
    })
    return newData
  }, [getMintInfo, metadata, poolData])

  return (
    <div className="card rounded-3xl p-6 bg-base-100 flex flex-col ">
      <p>Pool Weights</p>
      <div className="flex items-center justify-center h-[306px]">
        <DoughnutChart data={poolWeights} />
      </div>
    </div>
  )
}

export default PoolWeights
