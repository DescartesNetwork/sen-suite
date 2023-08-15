import { ReactNode, useMemo } from 'react'
import { BN } from 'bn.js'
import classNames from 'classnames'

import { MintAmount } from '@/components/mint'

import { numeric } from '@/helpers/utils'
import { useTvl } from '@/hooks/tvl.hook'
import {
  usePoolByAddress,
  useStatByPoolAddress,
  useStatLoading,
} from '@/providers/pools.provider'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'

const HeroCard = ({
  label,
  content,
  loading = false,
}: {
  label: string
  content: string | ReactNode
  loading?: boolean
}) => {
  return (
    <div className="card px-6 py-4 rounded-3xl bg-base-100 flex flex-col gap-2">
      <p className="opacity-60 text-sm">{label}</p>
      <h5
        className={classNames({
          'loading loading-bars loading-xs': loading,
        })}
      >
        {content}
      </h5>
    </div>
  )
}

const Heros = ({ poolAddress }: { poolAddress: string }) => {
  const pool = usePoolByAddress(poolAddress)
  const apyLoading = useStatLoading()
  const dailyInfo = useStatByPoolAddress(poolAddress)
  const { amount } = useTokenAccountByMintAddress(pool.mintLpt.toBase58()) || {
    amount: new BN(0),
  }

  const poolReserves = useMemo(
    () =>
      pool.reserves.map((reserve, i) => ({
        mintAddress: pool.mints[i].toBase58(),
        amount: reserve,
      })),
    [pool],
  )
  const tvl = useTvl(poolReserves)

  const poolApy = useMemo(() => {
    if (!poolAddress || !tvl || !dailyInfo) return 0
    let totalFee = 0
    let dateCount = 0
    for (const date in dailyInfo) {
      totalFee += dailyInfo[date].fee
      dateCount++
    }
    const feePerDay = totalFee / dateCount
    const roi = feePerDay / tvl
    const apy: number = Math.pow(1 + roi, 365) - 1
    return Number.isFinite(apy) ? apy : 0
  }, [dailyInfo, poolAddress, tvl])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <HeroCard label="TVL" content={numeric(tvl).format('0,0.[00]$')} />{' '}
      <HeroCard
        label="APY"
        loading={apyLoading}
        content={numeric(poolApy).format('0,0.[00]a%')}
      />
      <HeroCard
        label="My Contribution"
        content={
          <div className="flex items-center gap-2">
            <MintAmount amount={amount} mintAddress={pool.mintLpt.toBase58()} />
            <p className="opacity-60">LP</p>
          </div>
        }
      />
    </div>
  )
}

export default Heros
