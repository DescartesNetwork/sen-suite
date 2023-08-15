'use client'
import { ChangeEvent, Fragment, useCallback, useMemo, useState } from 'react'
import BN from 'bn.js'
import classNames from 'classnames'

import Modal from '@/components/modal'
import {
  MintAmount,
  MintLogo,
  MintSymbol,
  useMintAmount,
} from '@/components/mint'

import {
  useAllTokenAccounts,
  useTokenAccountByMintAddress,
} from '@/providers/tokenAccount.provider'
import { usePoolByAddress } from '@/providers/pools.provider'
import { useOracles } from '@/hooks/pool.hook'
import { numeric } from '@/helpers/utils'
import { useMints } from '@/hooks/spl.hook'
import { decimalize } from '@/helpers/decimals'

type MintInputProps = {
  mintAddress: string
  amount: string
  onAmount: (val: string) => void
  weights: BN[]
  index: number
}

const MintInput = ({
  mintAddress,
  amount,
  onAmount,
  weights,
  index,
}: MintInputProps) => {
  const [range, setRange] = useState('0')
  const { amount: mintAmount } = useTokenAccountByMintAddress(mintAddress) || {
    amount: new BN(0),
  }
  const balance = useMintAmount(mintAddress, mintAmount)
  const { calcNormalizedWeight } = useOracles()
  const normalizedWeight = calcNormalizedWeight(weights, weights[index])

  const onRange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const percentage = Number(e.target.value) / 100
      if (percentage > 0) onAmount(String(percentage * Number(balance)))
      setRange(e.target.value)
    },
    [balance, onAmount],
  )
  return (
    <div className="card bg-base-200 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12 flex flex-row gap-2 items-center">
        <div className="card bg-base-100 p-2 rounded-full flex flex-row gap-2 items-center cursor-pointer">
          <MintLogo
            mintAddress={mintAddress}
            className="w-6 h-6 rounded-full"
          />
          <h5 className="text-sm">
            <MintSymbol mintAddress={mintAddress} />{' '}
            {numeric(normalizedWeight).format('0,0.[0000]%')}
          </h5>
        </div>
        <input
          type="number"
          placeholder="0"
          className="input input-ghost flex-auto max-w-sm rounded-full focus:outline-none text-right text-xl"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
        />
      </div>
      <div className="col-span-12 flex flex-row gap-2 items-start justify-between">
        <div className="flex flex-col">
          <p className="text-xs font-bold opacity-60">Available</p>
          <p>
            <MintAmount mintAddress={mintAddress} amount={mintAmount} />
          </p>
        </div>
        <div className="flex-auto max-w-[112px]">
          <input
            type="range"
            min={0}
            max={100}
            step={50}
            className="range range-xs range-primary"
            value={range}
            onChange={onRange}
          />
          <div className="w-full flex flex-row justify-between px-1 text-[9px] opacity-60">
            <span>|</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const Deposit = ({ poolAddress }: { poolAddress: string }) => {
  const pool = usePoolByAddress(poolAddress)
  const [open, setOpen] = useState(false)
  const [amounts, setAmounts] = useState<string[]>(
    new Array(pool.mints.length).fill('0'),
  )
  const { calcLptOut, calcLpForTokensZeroPriceImpact } = useOracles()
  const accounts = useAllTokenAccounts()
  const mints = useMints(pool.mints.map((mint) => mint.toBase58()))
  const [mintLpt] = useMints([pool.mintLpt.toBase58()])
  const decimals = mints.map((mint) => mint?.decimals || 0)

  const onAmounts = (index: number, amount: string) => {
    const nextAmounts = [...amounts]
    nextAmounts[index] = amount
    setAmounts(nextAmounts)
  }

  const { lptOut, priceImpact } = useMemo(() => {
    const { reserves, weights, fee, taxFee } = pool
    const amountIns = amounts.map((amount, index) =>
      decimalize(amount, decimals[index]),
    )
    const out = calcLptOut(
      amountIns,
      reserves,
      weights,
      mintLpt?.supply || new BN(0),
      decimals,
      fee.add(taxFee),
    )

    const lpOutZeroPriceImpact = Number(
      calcLpForTokensZeroPriceImpact(
        amountIns,
        reserves,
        weights,
        mintLpt?.supply || new BN(0),
        decimals,
      ).toFixed(9),
    )
    const priceImpact = 1 - out / lpOutZeroPriceImpact
    return { lptOut: out, priceImpact: priceImpact || 0 }
  }, [
    amounts,
    calcLpForTokensZeroPriceImpact,
    calcLptOut,
    decimals,
    mintLpt?.supply,
    pool,
  ])

  const ok = useMemo(() => {
    for (const index in amounts) {
      const { amount: mintAmount } = Object.values(accounts).find(({ mint }) =>
        mint.equals(pool.mints[index]),
      ) || { amount: new BN(0) }

      const amount = decimalize(amounts[index], decimals[index])
      if (mintAmount.lt(amount)) return false
    }
    return !!lptOut && priceImpact < 0.05
  }, [accounts, amounts, decimals, lptOut, pool.mints, priceImpact])

  return (
    <Fragment>
      <button onClick={() => setOpen(true)} className="btn btn-primary btn-sm">
        Deposit
      </button>
      <Modal open={open} onCancel={() => setOpen(false)}>
        <div className="grid grid-cols-12 gap-6">
          <h5 className="col-span-full">Deposit</h5>
          <div className="col-span-full flex flex-col gap-2  max-h-96 overflow-y-auto overflow-x-hidden no-scrollbar">
            {pool.mints.map((mint, index) => (
              <MintInput
                key={mint.toBase58()}
                amount={amounts[index]}
                mintAddress={mint.toBase58()}
                onAmount={(amount) => onAmounts(index, amount)}
                index={index}
                weights={pool.weights}
              />
            ))}
          </div>
          <div className="col-span-full flex flex-col gap-2">
            <div className="flex flex-row items-center">
              <p className="flex-auto text-sm opacity-60">Price Impact</p>
              <p
                className={classNames('text-[#FA8C16]', {
                  'text-[#14E041]': !priceImpact || priceImpact < 0.01,
                  'text-[#D72311]': priceImpact > 0.05,
                })}
              >
                {numeric(priceImpact).format('0,0.[0000]%')}
              </p>
            </div>
            <div className="flex flex-row items-center">
              <p className="flex-auto text-sm opacity-60">You will receive</p>
              <p>
                {lptOut > 0 && lptOut < 0.0001
                  ? 'LP < 0.0001'
                  : numeric(lptOut).format('0,0.[0000]')}{' '}
                LP
              </p>
            </div>
          </div>
          <button disabled={!ok} className="btn btn-primary col-span-12">
            Deposit
          </button>
        </div>
      </Modal>
    </Fragment>
  )
}

export default Deposit
