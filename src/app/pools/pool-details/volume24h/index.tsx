import { useMemo } from 'react'

import BarChart from './barChart'

import { numeric } from '@/helpers/utils'
import { VolumeData, useVol24h } from '@/hooks/pool.hook'

export default function Volume24h({ poolAddress }: { poolAddress: string }) {
  const { vols, isLoading, vol24h } = useVol24h(poolAddress)

  const vol24hIn7Date = useMemo(() => {
    if (!vols) return []
    const { volumes } = vols
    const data: VolumeData[] = []
    for (const ymd in volumes) {
      const m = ymd.slice(4, 6)
      const d = ymd.slice(6, 8)

      data.push({ data: volumes[ymd], label: `${d}/${m}` })
    }
    return data
  }, [vols])

  return (
    <div className="card rounded-3xl p-6 bg-[#F2F4FA] dark:bg-[#212C4C] flex flex-col gap-6">
      <div className="flex items-center">
        <p className="flex-auto">Volume 24h</p>
        <h5>{numeric(vol24h).format('0,0.[0]a$')}</h5>
      </div>
      <div className="flex items-center justify-center h-[278px] ">
        {!isLoading ? (
          <BarChart data={vol24hIn7Date} />
        ) : (
          <span className="loading loading-spinner loading-lg" />
        )}
      </div>
    </div>
  )
}
