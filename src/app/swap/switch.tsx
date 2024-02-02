'use client'
import { useCallback } from 'react'

import { ArrowUpDown } from 'lucide-react'

import { useSwapStore } from '@/providers/swap.provider'

export default function Switch() {
  const bidMintAddress = useSwapStore(({ bidMintAddress }) => bidMintAddress)
  const setBidMintAddress = useSwapStore(
    ({ setBidMintAddress }) => setBidMintAddress,
  )
  const setBidAmount = useSwapStore(({ setBidAmount }) => setBidAmount)
  const askMintAddress = useSwapStore(({ askMintAddress }) => askMintAddress)
  const setAskMintAddress = useSwapStore(
    ({ setAskMintAddress }) => setAskMintAddress,
  )
  const setAskAmount = useSwapStore(({ setAskAmount }) => setAskAmount)

  const onSwitch = useCallback(() => {
    setBidAmount('')
    setAskAmount('')
    setBidMintAddress(askMintAddress)
    setAskMintAddress(bidMintAddress)
  }, [
    bidMintAddress,
    setBidMintAddress,
    setBidAmount,
    askMintAddress,
    setAskMintAddress,
    setAskAmount,
  ])

  return (
    <button
      className="btn btn-sm btn-square bg-base-100 shadow-md"
      onClick={onSwitch}
    >
      <ArrowUpDown className="h-4 w-4" />
    </button>
  )
}
