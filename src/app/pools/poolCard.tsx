import { useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import BN from 'bn.js'
import Link from 'next/link'

import Clipboard from '@/components/clipboard'
import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'
import { Snowflake, User } from 'lucide-react'

import { solscan } from '@/helpers/explorers'
import { numeric, shortenAddress } from '@/helpers/utils'
import { usePoolByAddress } from '@/providers/pools.provider'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { useOracles } from '@/hooks/pool.hook'
import { useTvl } from '@/hooks/tvl.hook'

type PoolCardProps = {
  poolAddress: string
}
const PoolCard = ({ poolAddress }: PoolCardProps) => {
  const pool = usePoolByAddress(poolAddress)
  const { publicKey } = useWallet()
  const { amount } = useTokenAccountByMintAddress(pool.mintLpt.toBase58()) || {
    amount: new BN(0),
  }
  const { calcNormalizedWeight } = useOracles()

  const poolReserves = useMemo(
    () =>
      pool.reserves.map((reserve, i) => ({
        mintAddress: pool.mints[i].toBase58(),
        amount: reserve,
      })),
    [pool],
  )
  const tvl = useTvl(poolReserves)

  const poolWeights = useMemo(() => {
    const { weights, mints } = pool
    return mints.map((mint, index) => {
      const normalizedWeight = calcNormalizedWeight(weights, weights[index])
      return { weight: normalizedWeight, mintAddress: mint.toBase58() }
    })
  }, [calcNormalizedWeight, pool])

  return (
    <Link
      href={`/pools/${poolAddress}`}
      className="card p-4 border border-[#fffc] bg-[#F2F4FA] dark:bg-[#212C4C] dark:border-[#394360] flex flex-col rounded-3xl gap-3 hover:border-[#63E0B3] dark:hover:border-[#63E0B3]"
    >
      <div className="flex flex-row items-center">
        <div className="flex-auto">
          <MintLogo
            className="w-8 h-8 rounded-full"
            mintAddress={pool.mintLpt.toBase58()}
          />
        </div>
        <div className="flex flex-row gap-2 items-center">
          {pool.state['frozen'] && (
            <div className="tooltip" data-tip="Frozen Pool">
              <Snowflake />
            </div>
          )}
          {publicKey && pool.authority.equals(publicKey) && (
            <div className="tooltip" data-tip="Your Pool">
              <User name="person-outline" />
            </div>
          )}
          <p
            onClick={() => window.open(solscan(poolAddress), '_blank')}
            className="opacity-60 cursor-pointer hover:underline"
          >
            {shortenAddress(poolAddress)}
          </p>
          <Clipboard content={poolAddress} />
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center mb-3 flex-wrap">
        <p className="mr-2">Balansol LP</p>
        {poolWeights.map(({ mintAddress, weight }, i) => (
          <div
            key={i}
            className="card bg-base-100 px-2 py-1 flex flex-row gap-1"
          >
            <p>{numeric(weight).format('0,0.[00]%')}</p>
            <MintSymbol mintAddress={mintAddress} />
          </div>
        ))}
      </div>
      <div className="flex gap-6">
        <div className="flex gap-2 flex-col">
          <p className="text-xs opacity-60">TVL:</p>
          <p>{numeric(tvl).format('0,0.[00]$')}</p>
        </div>
        <div className="flex gap-2 flex-col">
          <p className="text-xs opacity-60">My contribution:</p>
          <p>
            <MintAmount amount={amount} mintAddress={pool.mintLpt.toBase58()} />{' '}
            LP
          </p>
        </div>
      </div>
    </Link>
  )
}

export default PoolCard
