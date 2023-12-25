'use client'
import { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import classNames from 'classnames'
import BN from 'bn.js'

import { usePoolByAddress } from '@/providers/pools.provider'
import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'

import { useMints } from '@/hooks/spl.hook'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { GENERAL_DECIMALS, LPT_DECIMALS, useOracles } from '@/hooks/pool.hook'
import { numeric } from '@/helpers/utils'

type TokenReceiveProps = {
  poolAddress: string
  lptAmount: string
  mintAddress?: string
}
export default function TokenReceive({
  poolAddress,
  mintAddress,
  lptAmount,
}: TokenReceiveProps) {
  const pool = usePoolByAddress(poolAddress)
  const [mintLpt] = useMints([pool.mintLpt.toBase58()])
  const mints = useMints(pool.mints.map((mint) => mint.toBase58()))
  const decimals = mints.map((mint) => mint?.decimals || 0)
  const { calcNormalizedWeight, calcLpForTokensZeroPriceImpact } = useOracles()

  const listMints = useMemo(
    () => (mintAddress ? [new PublicKey(mintAddress)] : pool.mints),
    [mintAddress, pool.mints],
  )

  const amountsReceive = useMemo(() => {
    let amounts: BN[] = new Array(pool.reserves.length).fill(new BN(0))
    if (!mintLpt?.supply || mintAddress || !lptAmount) return amounts

    const lp = decimalize(lptAmount, LPT_DECIMALS).toNumber()
    const lpt_rate = lp / Number(mintLpt.supply)
    amounts = pool.reserves.map((reserve) => new BN(lpt_rate * Number(reserve)))

    return amounts
  }, [lptAmount, mintLpt, pool.reserves, mintAddress])

  const complement = (value: number) => {
    return value < 1 ? 1 - value : 0
  }

  const singleAmount = useMemo(() => {
    if (!mintAddress || !mintLpt?.supply) return
    const { weights, reserves, fee, tax } = pool
    const index = pool.mints.findIndex(
      (mint) => mint.toBase58() === mintAddress,
    )
    if (index === -1) return
    const reserve = reserves[index]
    const numReserve = Number(undecimalize(reserve, decimals[index]))
    const numFee = Number(undecimalize(fee.add(tax), GENERAL_DECIMALS))
    const numLpAmount = Number(lptAmount)
    const numSupply = Number(undecimalize(mintLpt.supply, LPT_DECIMALS))
    const normalizedWeight = calcNormalizedWeight(weights, weights[index])

    const invariantRatio = (numSupply - numLpAmount) / numSupply
    const balanceRatio = invariantRatio ** (1 / normalizedWeight)
    const amountOutWithoutFee = numReserve * complement(balanceRatio)
    // We can now compute how much excess balance is being withdrawn as a result of the virtual swaps,
    // which result in swap fees
    const taxablePercentage = complement(normalizedWeight)
    // Swap fees are typically charged on 'tokenIn', but there is no 'tokenIn' here, so we apply it
    // to 'tokenOut' - this results in slightly larger price impact (fees are rounded up)
    const taxableAmount = amountOutWithoutFee * taxablePercentage
    const nonTaxableAmount = amountOutWithoutFee - taxableAmount
    const result = nonTaxableAmount + taxableAmount * complement(numFee)
    return decimalize(result.toString(), decimals[index])
  }, [calcNormalizedWeight, decimals, lptAmount, mintAddress, mintLpt, pool])

  const priceImpact = useMemo(() => {
    if (!singleAmount || !mintAddress) return 0
    const { mints, reserves, weights } = pool
    const amountIns = mints.map((mint) =>
      mint.toBase58() === mintAddress ? singleAmount : new BN(0),
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
    if (Number(lptAmount) < lpOutZeroPriceImpact) return 0
    return Number(lptAmount) / lpOutZeroPriceImpact - 1
  }, [
    calcLpForTokensZeroPriceImpact,
    decimals,
    lptAmount,
    mintAddress,
    mintLpt,
    pool,
    singleAmount,
  ])

  return (
    <div className="grid grid-cols-12 gap-3  max-h-48 overflow-y-auto overflow-x-hidden no-scrollbar">
      {!!mintAddress && (
        <div className="col-span-full flex justify-between items-center">
          <p className="text-sm opacity-60">Price Impact</p>
          <p
            className={classNames('text-[#FA8C16]', {
              '!text-[#14E041]': !priceImpact || priceImpact < 0.01,
              '!text-[#D72311]': priceImpact > 0.05,
            })}
          >
            {numeric(priceImpact).format('0,0.[0000]%')}
          </p>
        </div>
      )}
      <p className="col-span-full text-sm opacity-60">You will receive</p>
      {listMints.map((mint, i) => (
        <div
          key={mint.toBase58()}
          className="col-span-full flex gap-3 items-center"
        >
          <div className="flex-auto flex gap-2 items-center ">
            <MintLogo
              className="h-6 w-6 rounded-full"
              mintAddress={mint.toBase58()}
            />
            <p className="opacity-60">
              <MintSymbol mintAddress={mint.toBase58()} />
            </p>
          </div>
          <MintAmount
            mintAddress={mint.toBase58()}
            amount={singleAmount ? singleAmount : amountsReceive[i]}
          />
        </div>
      ))}
    </div>
  )
}
