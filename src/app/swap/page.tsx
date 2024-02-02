'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'

import Ask from './ask'
import Bid from './bid'
import SwapSettings from './swapSettings'
import SwapInfo from './swapInfo'
import Switch from './switch'
import { MintSymbol } from '@/components/mint'

import { useJupAgSwap, useSenswapSwap } from '@/hooks/swap.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'
import { useSwapStore } from '@/providers/swap.provider'

export default function Swap() {
  const [swapping, setSwapping] = useState(false)
  const overBudget = useSwapStore(({ overBudget }) => overBudget)
  const bidMintAddress = useSwapStore(({ bidMintAddress }) => bidMintAddress)
  const setBidAmount = useSwapStore(({ setBidAmount }) => setBidAmount)
  const setAskAmount = useSwapStore(({ setAskAmount }) => setAskAmount)
  const pushMessage = usePushMessage()

  // Get routes
  const { value: senValue, loading: fconLoading } = useSenswapSwap()
  const { value: jupValue, loading: jupLoading } = useJupAgSwap()

  const route = useMemo(() => {
    if (!jupValue) return senValue
    if (!senValue) return jupValue
    // If Senswap's price impact is not greater than JUP's price impact 5%, we prioritize Senswap
    const delta = Math.abs(senValue.priceImpact - jupValue.priceImpact)
    if (delta > 0.05) return jupValue
    return senValue
  }, [senValue, jupValue])

  const loading = useMemo(() => {
    return fconLoading || jupLoading
  }, [fconLoading, jupLoading])

  // Feedback
  const ok = useMemo(() => {
    if (overBudget) return false
    if (!route) return false
    return true
  }, [overBudget, route])

  const onSwap = useCallback(async () => {
    try {
      setSwapping(true)
      if (!route) throw new Error('Unexpected error.')
      const txId = await route.swap()
      setBidAmount('')
      pushMessage(
        'alert-success',
        'Successfully swap your tokens. Click here to view the transaction details.',
        { onClick: () => window.open(solscan(txId), '_blank') },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setSwapping(false)
    }
  }, [route, setBidAmount, pushMessage])

  useEffect(() => {
    setAskAmount(route?.askAmount || '')
  }, [route?.askAmount, setAskAmount])

  return (
    <div className="grid grid-cols-12 gap-2 card rounded-3xl bg-base-100 shadow-xl p-4">
      <div className="col-span-12 flex flex-row gap-2 items-center pb-2">
        <h5 className="flex-auto">Swap</h5>
        <SwapSettings />
      </div>
      <div className="col-span-12">
        <Bid />
      </div>
      <div className="col-span-12 flex flex-row justify-center -my-4 z-[1]">
        <Switch />
      </div>
      <div className="col-span-12">
        <Ask />
      </div>
      <div className="col-span-12">
        <SwapInfo route={route} />
      </div>
      <div className="col-span-12">
        <button
          className="btn btn-primary w-full rounded-full"
          disabled={!ok || loading || swapping}
          onClick={onSwap}
        >
          <span className={clsx({ hidden: !overBudget })}>
            Insufficient <MintSymbol mintAddress={bidMintAddress} />
          </span>
          <span className={clsx({ hidden: overBudget })}>Swap</span>
          <span
            className={clsx('loading loading-sm loading-spinner', {
              hidden: !loading && !swapping,
            })}
          />
        </button>
      </div>
    </div>
  )
}
