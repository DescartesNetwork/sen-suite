'use client'
import { Fragment, useMemo, useState } from 'react'
import clsx from 'clsx'

import Image from 'next/image'
import { ArrowLeftRight, ChevronRight, Diamond } from 'lucide-react'
import { useMintSymbol } from '@/components/mint'
import Island from '@/components/island'

import { numeric } from '@/helpers/utils'
import { useMintByAddress } from '@/providers/mint.provider'
import {
  jupiterLightSvg,
  jupiterDarkSvg,
} from '@/static/images/welcome/partners'
import { useTheme } from '@/providers/ui.provider'
import { useSwapStore } from '@/providers/swap.provider'

export type SwapInfoProps = {
  route?: Partial<GeneralSwapInfo>
}

function Price({
  route: {
    bidAmount,
    bidMintAddress = '',
    askAmount,
    askMintAddress = '',
  } = {},
}: SwapInfoProps) {
  const [reversed, setReversed] = useState(false)
  const bidMintSymbol = useMintSymbol(bidMintAddress)
  const askMintSymbol = useMintSymbol(askMintAddress)

  const price = useMemo(() => {
    if (!Number(bidAmount) || !Number(askAmount)) return 0
    if (reversed) return Number(askAmount) / Number(bidAmount)
    return Number(bidAmount) / Number(askAmount)
  }, [bidAmount, askAmount, reversed])

  const ticket = useMemo(() => {
    if (!bidMintSymbol || !askMintSymbol) return '-'
    if (reversed) return `${askMintSymbol}/${bidMintSymbol}`
    return `${bidMintSymbol}/${askMintSymbol}`
  }, [bidMintSymbol, askMintSymbol, reversed])

  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Price</p>
      <p
        className="text-sm font-bold flex flex-row gap-2 items-center cursor-pointer"
        onClick={() => setReversed(!reversed)}
      >
        <ArrowLeftRight
          className={clsx('h-3 w-3', {
            hidden: !price,
          })}
        />
        <span className={clsx({ hidden: !price })}>
          {numeric(price).format('0,0.[000000]')}
        </span>
        <span className="opacity-60">{ticket}</span>
      </p>
    </div>
  )
}

function PriceImpact({ route: { priceImpact = 0 } = {} }: SwapInfoProps) {
  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Price Impact</p>
      <p className="text-sm font-bold">
        {numeric(priceImpact).format('0.[0000]%')}
      </p>
    </div>
  )
}

function SlippageTolerance() {
  const slippage = useSwapStore(({ slippage }) => slippage)
  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Slippage Tolerance</p>
      <div
        className={clsx('badge', {
          'badge-error': slippage >= 1,
          'badge-warning': slippage >= 0.05 && slippage < 1,
          'badge-success': slippage < 0.05,
        })}
      >
        <p className="text-sm font-bold">
          {slippage === 1 ? 'Free' : `${slippage * 100}%`}
        </p>
      </div>
    </div>
  )
}

function PoweredByJupAf() {
  const { theme } = useTheme()

  const jup = useMemo(() => {
    if (theme === 'light') return jupiterLightSvg
    return jupiterDarkSvg
  }, [theme])

  return (
    <span className="flex flex-row gap-2 justify-end items-center">
      <p className="text-[9px] opacity-60">Powered by</p>
      <Image className="w-12" src={jup} alt="jupiter" />
    </span>
  )
}

function Hop({ mintAddress }: { mintAddress: string }) {
  const { logoURI = '', symbol = mintAddress.substring(0, 6) } =
    useMintByAddress(mintAddress) || {}

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

function Routes({ route: { route = [], platform } = {} }: SwapInfoProps) {
  return (
    <div className="flex flex-row gap-1">
      <p className="text-sm opacity-60">Routes</p>
      <div className="flex-auto flex flex-col gap-2">
        <span className="flex flex-row gap-1 justify-end items-center">
          {route.map((mintAddress, i) => (
            <Fragment key={i}>
              {i !== 0 && <ChevronRight className="w-4 h-4" />}
              <Hop mintAddress={mintAddress} />
            </Fragment>
          ))}
          <p className={clsx({ hidden: route.length })}>-</p>
        </span>
        <span
          className={clsx('flex flex-row gap-2 justify-end', {
            hidden: platform !== 'Jupiter Aggregator',
          })}
        >
          <Island>
            <PoweredByJupAf />
          </Island>
        </span>
      </div>
    </div>
  )
}

export default function SwapInfo({ route }: SwapInfoProps) {
  return (
    <div className="card bg-base-100 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12">
        <Price route={route} />
      </div>
      <div className="col-span-12">
        <PriceImpact route={route} />
      </div>
      <div className="col-span-12">
        <SlippageTolerance />
      </div>
      <div className="col-span-12">
        <Routes route={route} />
      </div>
    </div>
  )
}
