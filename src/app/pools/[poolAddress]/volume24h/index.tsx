import { numeric } from '@/helpers/utils'
import BarChart from './barChart'

import { useVolume24h } from '@/hooks/pool.hook'
import { useStatLoading } from '@/providers/pools.provider'

const Volume24h = ({ poolAddress }: { poolAddress: string }) => {
  const { vol24h, chartData } = useVolume24h(poolAddress)
  const loading = useStatLoading()

  return (
    <div className="card rounded-3xl p-6 bg-base-100 flex flex-col">
      <div className="flex items-center">
        <p className="flex-auto">Volume 24h</p>
        <h5>{numeric(vol24h).format('0,0.[0]a$')}</h5>
      </div>
      <div className="flex items-center justify-center h-[302px]">
        {!loading ? (
          <BarChart data={chartData} />
        ) : (
          <span className="loading loading-bars" />
        )}
      </div>
    </div>
  )
}

export default Volume24h
