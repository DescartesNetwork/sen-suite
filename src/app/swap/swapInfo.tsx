'use client'
import { Fragment, useMemo } from 'react'
import { BN } from 'bn.js'

import { TokenLogo, TokenSymbol } from '@/components/token'
import { ChevronRight } from 'lucide-react'

import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { useSwap, useSwapStore } from '@/hooks/swap.hook'
import { useTokenByAddress } from '@/providers/token.provider'

function PriceImpact() {
  const {
    routes: [bestRoute],
  } = useSwap()

  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Price Impact</p>
      <p className="text-sm font-bold">
        {numeric(bestRoute?.priceImpactPct || 0).format('0.[000000]')}%
      </p>
    </div>
  )
}

function Price() {
  const { bidTokenAddress, askTokenAddress } = useSwapStore()
  const {
    routes: [bestRoute],
  } = useSwap()

  const { decimals: bidDecimals } = useTokenByAddress(bidTokenAddress) || {
    decimals: 0,
  }
  const bidAmount = useMemo(
    () => Number(undecimalize(new BN(bestRoute?.inAmount || '0'), bidDecimals)),
    [bestRoute?.inAmount, bidDecimals],
  )
  const { decimals: askDecimals } = useTokenByAddress(askTokenAddress) || {
    decimals: 0,
  }
  const askAmount = useMemo(
    () =>
      Number(undecimalize(new BN(bestRoute?.outAmount || '0'), askDecimals)),
    [bestRoute?.outAmount, askDecimals],
  )

  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Price</p>
      <p className="text-sm font-bold">
        {numeric(bidAmount / askAmount).format('0,0.[000000]')}
      </p>
      <p className="text-sm font-bold opacity-60">
        <TokenSymbol tokenAddress={bidTokenAddress} />
        <span>/</span>
        <TokenSymbol tokenAddress={askTokenAddress} />
      </p>
    </div>
  )
}

function SlippageTolerance() {
  const slippage = useSwapStore(({ slippage }) => slippage)
  const value = slippage === 1 ? 'Free' : `${slippage * 100}%`
  let className = 'badge'
  if (slippage >= 1) className = className + ' badge-error'
  else if (slippage >= 0.05) className = className + ' badge-warning'
  else className = className + ' badge-success'

  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Slippage Tolerance</p>
      <div className={className}>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  )
}

function Routes() {
  const {
    routes: [bestRoute],
  } = useSwap()

  const hops = useMemo(() => {
    if (!bestRoute?.marketInfos) return []
    const hops: string[] = []
    bestRoute?.marketInfos.forEach(({ inputMint, outputMint }) => {
      hops.pop()
      hops.push(inputMint)
      hops.push(outputMint)
    })
    return hops
  }, [bestRoute?.marketInfos])

  return (
    <div className="flex flex-row gap-1 items-center">
      <p className="flex-auto text-sm opacity-60">Routes</p>
      {hops.map((tokenAddress, i) => (
        <Fragment key={i}>
          {i !== 0 && <ChevronRight className="w-4 h-4" />}
          <TokenLogo
            className="w-6 h-6 rounded-full shadow-sm"
            tokenAddress={tokenAddress}
          />
        </Fragment>
      ))}
    </div>
  )
}

export default function SwapInfo() {
  return (
    <div className="card bg-base-100 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12">
        <Price />
      </div>
      <div className="col-span-12">
        <PriceImpact />
      </div>
      <div className="col-span-12">
        <SlippageTolerance />
      </div>
      <div className="col-span-12">
        <Routes />
      </div>
    </div>
  )
}
