'use client'
import { Fragment, useMemo } from 'react'
import { BN } from 'bn.js'

import { MintSymbol } from '@/components/mint'
import { ChevronRight, Diamond } from 'lucide-react'

import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { useSwap, useSwapStore } from '@/hooks/swap.hook'
import { useMintByAddress } from '@/providers/mint.provider'

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
  const { bidMintAddress, askMintAddress } = useSwapStore()
  const {
    routes: [bestRoute],
  } = useSwap()

  const { decimals: bidDecimals } = useMintByAddress(bidMintAddress) || {
    decimals: 0,
  }
  const bidAmount = useMemo(
    () => Number(undecimalize(new BN(bestRoute?.inAmount || '0'), bidDecimals)),
    [bestRoute?.inAmount, bidDecimals],
  )
  const { decimals: askDecimals } = useMintByAddress(askMintAddress) || {
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
        <MintSymbol mintAddress={bidMintAddress} />
        <span>/</span>
        <MintSymbol mintAddress={askMintAddress} />
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

function Hop({ mintAddress }: { mintAddress: string }) {
  const { logoURI, symbol } = useMintByAddress(mintAddress) || {
    logoURI: '',
    symbol: mintAddress.substring(0, 6),
  }

  return (
    <span className="tooltip flex" data-tip={symbol}>
      <div className="avatar placeholder cursor-pointer">
        <div className="w-6 h-6 rounded-full shadow-sm">
          {logoURI ? (
            <img src={logoURI} alt={symbol} />
          ) : (
            <Diamond className="text-base-content" />
          )}
        </div>
      </div>
    </span>
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
      {hops.map((mintAddress, i) => (
        <Fragment key={i}>
          {i !== 0 && <ChevronRight className="w-4 h-4" />}
          <Hop mintAddress={mintAddress} />
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
