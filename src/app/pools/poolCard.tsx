'use client'
import { useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import BN from 'bn.js'
import classNames from 'classnames'
import isEqual from 'react-fast-compare'
import { PoolStates } from '@sentre/senswap'

import { Snowflake, User } from 'lucide-react'
import Clipboard from '@/components/clipboard'
import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'
import NewWindow from '@/components/newWindow'

import { solscan } from '@/helpers/explorers'
import { numeric, shortenAddress } from '@/helpers/utils'
import { usePoolByAddress } from '@/providers/pools.provider'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { useOracles, useVol24h } from '@/hooks/pool.hook'
import { useTvl } from '@/hooks/tvl.hook'

export type PoolCardProps = {
  poolAddress: string
}

export default function PoolCard({ poolAddress }: PoolCardProps) {
  const { push } = useRouter()
  const { state, mintLpt, authority, reserves, mints, weights } =
    usePoolByAddress(poolAddress) || {}
  const { publicKey } = useWallet()
  const { amount } = useTokenAccountByMintAddress(mintLpt.toBase58()) || {
    amount: new BN(0),
  }
  const { calcNormalizedWeight } = useOracles()
  const { vol24h, isLoading } = useVol24h(poolAddress)

  const isFrozen = useMemo(() => {
    return isEqual(state, PoolStates.Frozen)
  }, [state])
  const isOwner = useMemo(() => {
    if (!publicKey || !authority) return false
    return authority.equals(publicKey)
  }, [publicKey, authority])

  const tvl = useTvl(
    reserves.map((reserve, i) => ({
      mintAddress: mints[i].toBase58(),
      amount: reserve,
    })),
  )

  const poolWeights = useMemo(() => {
    return mints.map((mint, index) => {
      const normalizedWeight = calcNormalizedWeight(weights, weights[index])
      return { weight: normalizedWeight, mintAddress: mint.toBase58() }
    })
  }, [calcNormalizedWeight, weights, mints])

  return (
    <div
      onClick={() => {
        if (isFrozen && !isOwner) return
        return push(`/pools/pool-details?poolAddress=${poolAddress}`)
      }}
      className={classNames(
        'card p-4 bg-base-100 border border-base-300 flex flex-col rounded-3xl gap-3 cursor-pointer',
        {
          'hover:!border-accent': !isFrozen || isOwner,
        },
      )}
    >
      <div className="flex flex-row items-center">
        <div className="flex-auto flex gap-2 items-center">
          <MintLogo
            className="w-8 h-8 rounded-full"
            mintAddress={mintLpt.toBase58()}
          />
          <p className="font-bold">
            <MintSymbol mintAddress={mintLpt.toBase58()} />
          </p>
        </div>
        <div className="flex flex-row gap-2 items-center">
          {isFrozen && (
            <div className="tooltip" data-tip="Frozen Pool">
              <Snowflake size={16} />
            </div>
          )}
          {isOwner && (
            <div className="tooltip" data-tip="Your Pool">
              <User size={16} name="person-outline" />
            </div>
          )}
          <p
            onClick={() => window.open(solscan(poolAddress), '_blank')}
            className="opacity-60 cursor-pointer hover:underline"
          >
            {shortenAddress(poolAddress)}
          </p>
          <NewWindow href={solscan(poolAddress || '')} />
          <Clipboard content={poolAddress} />
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center mb-3 flex-wrap">
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
          <p className="text-xs opacity-60">Vol 24h:</p>
          <p
            className={classNames({
              'loading loading-spinner loading-xs': isLoading,
            })}
          >
            {numeric(vol24h).format('0,0.[00]$')}
          </p>
        </div>
        <div className="flex gap-2 flex-col">
          <p className="text-xs opacity-60">My contribution:</p>
          <p>
            <MintAmount amount={amount} mintAddress={mintLpt.toBase58()} /> LP
          </p>
        </div>
      </div>
      {/* frozen mask */}
      {isFrozen && !isOwner && (
        <div className="absolute w-full h-full rounded-3xl top-0 left-0 bg-base-200 opacity-60 cursor-not-allowed z-10" />
      )}
    </div>
  )
}
