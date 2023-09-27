'use client'
import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'
import { WRAPPED_SOL_MINT } from '@metaplex-foundation/js'
import BN from 'bn.js'

import {
  MintAmount,
  MintLogo,
  MintSymbol,
  useMintAmount,
} from '@/components/mint'

import { useLaunchpadByAddress } from '@/providers/launchpad.provider'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { useLamports } from '@/providers/wallet.provider'
import {
  useBuyToken,
  useCalcInGivenOutSwap,
  useLaunchpadWeight,
} from '@/hooks/launchpad.hook'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { usePoolByAddress } from '@/providers/pools.provider'
import { useMints } from '@/hooks/spl.hook'
import { numeric } from '@/helpers/utils'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

type BuyTokenProps = {
  launchpadAddress: string
}
export default function BuyToken({ launchpadAddress }: BuyTokenProps) {
  const [amount, setAmount] = useState('0')
  const [range, setRange] = useState('0')
  const [askAmount, setAskAmount] = useState(new BN(0))
  const [loading, setLoading] = useState(false)
  const { mint, stableMint, pool, startTime } =
    useLaunchpadByAddress(launchpadAddress)
  const { reserves, taxFee, fee } = usePoolByAddress(pool.toBase58())
  const mintAddress = mint.toBase58()
  const lamports = useLamports()
  const [stableMintInfo, mintInfo] = useMints([
    stableMint.toBase58(),
    mintAddress,
  ])
  const { amount: mintAmount } = useTokenAccountByMintAddress(
    stableMint.toBase58(),
  ) || {
    amount: new BN(0),
  }
  const calcOutGivenInSwap = useCalcInGivenOutSwap()
  const currentWeights = useLaunchpadWeight(launchpadAddress)
  const buyToken = useBuyToken(amount, launchpadAddress)
  const pushMessage = usePushMessage()
  const isStarted = Date.now() / 1000 > startTime.toNumber()

  const tokenOrLamportsAmount = useMemo(() => {
    if (!WRAPPED_SOL_MINT.equals(stableMint)) return mintAmount
    return mintAmount.add(new BN(lamports))
  }, [lamports, mintAmount, stableMint])

  const balance = useMintAmount(stableMint.toBase58(), tokenOrLamportsAmount)

  const onRange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const percentage = Number(e.target.value) / 100
      if (percentage > 0) setAmount(String(percentage * Number(balance)))
      setRange(e.target.value)
    },
    [balance],
  )

  const onBuyToken = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await buyToken()
      pushMessage(
        'alert-success',
        'Successfully buy token. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
      return setAmount('0')
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [buyToken, pushMessage])

  const rate = useMemo(() => {
    if (askAmount.isZero() || !amount) return 0
    return (
      Number(amount) / Number(undecimalize(askAmount, mintInfo?.decimals || 0))
    )
  }, [amount, askAmount, mintInfo?.decimals])

  const syncsAskAmount = useCallback(async () => {
    if (!amount) return setAskAmount(new BN(0))
    const bidAmount = decimalize(amount, stableMintInfo?.decimals || 0)
    const totalWeights = currentWeights[0] + currentWeights[1]

    const askAmount = calcOutGivenInSwap(
      bidAmount,
      reserves[0],
      reserves[1],
      currentWeights[0] / totalWeights,
      currentWeights[1] / totalWeights,
      fee.add(taxFee),
    )
    return setAskAmount(askAmount)
  }, [
    amount,
    calcOutGivenInSwap,
    currentWeights,
    fee,
    reserves,
    stableMintInfo?.decimals,
    taxFee,
  ])

  useDebounce(syncsAskAmount, 500, [syncsAskAmount])

  return (
    <div className="card rounded-3xl p-6 bg-[--accent-card] flex flex-col gap-6">
      {/* Ask amount */}
      <div className="flex flex-col gap-2">
        <p className="text-sm">You pay</p>
        <div className="card bg-base-100 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
          <div className="col-span-12 flex items-center justify-between">
            <div className="flex gap-2 items-center ">
              <MintLogo
                mintAddress={stableMint.toBase58()}
                className="w-8 h-8 rounded-full"
              />
              <h5 className="text-sm">
                <MintSymbol mintAddress={stableMint.toBase58()} />
              </h5>
            </div>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input input-ghost bg-base-100 w-full max-w-sm rounded-full focus:outline-none flex-auto text-right text-xl"
            />
          </div>
          <div className="col-span-12 flex gap-2 justify-between">
            <div className="flex flex-col">
              <p className="text-xs font-bold opacity-60">Available</p>
              <p>
                <MintAmount
                  mintAddress={stableMint.toBase58()}
                  amount={tokenOrLamportsAmount}
                />
              </p>
            </div>
            <div className="max-w-[112px]">
              <input
                type="range"
                min={0}
                max={100}
                step={50}
                value={range}
                onChange={onRange}
                className="range range-xs range-primary"
              />
              <div className="w-full flex flex-row justify-between px-1 text-[9px] opacity-60">
                <span>|</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bid amount */}
      <div className="flex flex-col gap-2">
        <p className="text-sm">You receive</p>
        <div className=" flex items-center justify-between">
          <div className="flex gap-2 items-center ">
            <MintLogo
              mintAddress={mintAddress}
              className="w-8 h-8 rounded-full"
            />
            <h5 className="text-sm">
              <MintSymbol mintAddress={mintAddress} />
            </h5>
          </div>
          <MintAmount mintAddress={mintAddress} amount={askAmount} />
        </div>
      </div>
      <div className="col-span-12 flex flex-row gap-2 items-start justify-between">
        <p className="text-sm">Rate</p>
        <p>
          1 <MintSymbol mintAddress={mintAddress} /> ={' '}
          {numeric(rate).format('0,0.[000]')}{' '}
          <MintSymbol mintAddress={mint.toBase58()} />
        </p>
      </div>
      <button
        disabled={
          !Number(amount) || Number(amount) > Number(balance) || !isStarted
        }
        className="btn btn-primary w-full rounded-full"
        onClick={onBuyToken}
      >
        {loading && <span className="loading loading-spinner loading-xs" />}
        Purchase
      </button>
    </div>
  )
}
