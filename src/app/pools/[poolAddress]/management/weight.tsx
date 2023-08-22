import { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'

import { Lock, Unlock } from 'lucide-react'
import { MintLogo, MintSymbol } from '@/components/mint'
import { usePushMessage } from '@/components/message/store'

import { numeric } from '@/helpers/utils'
import { solscan } from '@/helpers/explorers'
import { MintSetup, useOracles, usePoolManagement } from '@/hooks/pool.hook'
import { usePoolByAddress } from '@/providers/pools.provider'

const TOTAL_PERCENT = 100

const Weight = ({ poolAddress }: { poolAddress: string }) => {
  const [tokensInfo, setTokensInfo] = useState<Record<string, MintSetup>>()
  const [loading, setLoading] = useState(false)
  const [checkInput, setCheckInput] = useState(false)

  const pushMessage = usePushMessage()
  const { calcNormalizedWeight } = useOracles()
  const { updateWeights } = usePoolManagement(poolAddress)
  const { mints, weights } = usePoolByAddress(poolAddress)

  const fetchWeights = useCallback(() => {
    const nextWeights: Record<string, MintSetup> = {}
    mints.forEach((mint, index) => {
      const normalizedWeight = calcNormalizedWeight(weights, weights[index])
      const mintAddress = mint.toBase58()

      nextWeights[mintAddress] = {
        mintAddress,
        weight: numeric(normalizedWeight * 100).format('0,0.[00]'),
        isLocked: false,
      }
    })
    setTokensInfo(nextWeights)
  }, [calcNormalizedWeight, mints, weights])

  const onWeightChange = (val: string, mint: string) => {
    if (val) setCheckInput(true)

    const newTokensInfo = { ...tokensInfo }
    newTokensInfo[mint] = { ...newTokensInfo[mint], weight: val }

    let remainingPercent = TOTAL_PERCENT - Number(val)

    const amountTokenNotLock = Object.values(newTokensInfo).filter(
      (token) => !token.isLocked && token.mintAddress !== mint,
    ).length
    let firstTime = true

    for (const mintAddr of mints) {
      const { isLocked, weight, mintAddress } =
        newTokensInfo[mintAddr.toBase58()]

      if (mint === mintAddress) continue
      if (isLocked) {
        remainingPercent -= Number(weight)
        continue
      }

      const nextWeight = (remainingPercent / amountTokenNotLock).toFixed(2)

      if (firstTime) {
        const newWeight =
          remainingPercent - Number(nextWeight) * (amountTokenNotLock - 1)

        newTokensInfo[mintAddress] = {
          ...newTokensInfo[mintAddress],
          weight: numeric(newWeight).format('0,0.[00]'),
        }
        firstTime = false
        continue
      }

      newTokensInfo[mintAddress] = {
        ...newTokensInfo[mintAddress],
        weight: numeric(nextWeight).format('0,0.[00]'),
      }
    }

    return setTokensInfo(newTokensInfo)
  }

  const lockWeight = (mint: string) => {
    const newWeights = { ...tokensInfo }
    const { isLocked } = newWeights[mint]
    newWeights[mint] = { ...newWeights[mint], isLocked: !isLocked }

    setTokensInfo(newWeights)
  }

  const validateWeight = useCallback(
    (mint: string) => {
      if (!tokensInfo) return false
      const { weight } = tokensInfo[mint]
      const numWeight = Number(weight)
      if (numWeight > TOTAL_PERCENT || numWeight <= 0) return false

      let remainingPercent = 0
      for (const { mintAddress, weight } of Object.values(tokensInfo)) {
        if (mint === mintAddress) continue
        remainingPercent += Number(weight)
      }
      const actualWeight = TOTAL_PERCENT - remainingPercent
      return numWeight === Number(numeric(actualWeight).format('0,0.[00]'))
    },
    [tokensInfo],
  )

  const disabled = useMemo(() => {
    if (!tokensInfo) return true
    for (const mintAddress of Object.keys(tokensInfo)) {
      if (!validateWeight(mintAddress)) return true
    }
    return false
  }, [tokensInfo, validateWeight])

  const onUpdateWeights = async () => {
    if (!tokensInfo) return
    setLoading(true)
    try {
      const txId = await updateWeights(tokensInfo)
      return pushMessage('alert-success', 'Successfully Update weights', {
        onClick: () => window.open(solscan(txId || ''), '_blank'),
      })
    } catch (err: any) {
      pushMessage('alert-error', err.message)
    } finally {
      setLoading(false)
      setCheckInput(false)
    }
  }

  useEffect(() => {
    fetchWeights()
  }, [fetchWeights])

  return (
    <div className="flex flex-col gap-4">
      {mints.map((mint, idx) => {
        const addressToken = mint.toBase58()
        if (!tokensInfo) return null
        const { isLocked, weight } = tokensInfo[addressToken]
        return (
          <div
            key={addressToken + idx}
            className="card w-full grid grid-cols-12 gap-4 items-center"
          >
            <div className="card bg-base-200 p-2 rounded-3xl col-span-11">
              <div className="flex flex-row justify-between  gap-2 items-center">
                <div className="card bg-base-100 p-2 rounded-full flex flex-row gap-2 items-center cursor-pointer">
                  <MintLogo
                    mintAddress={addressToken}
                    className="w-6 h-6 rounded-full"
                  />
                  <h5 className="text-sm">
                    <MintSymbol mintAddress={addressToken} />
                  </h5>
                </div>
                <input
                  type="number"
                  placeholder="0"
                  disabled={isLocked}
                  value={weight}
                  onChange={(e) => onWeightChange(e.target.value, addressToken)}
                  className={classNames(
                    'input h-6 bg-base-200 w-full rounded-full focus:outline-none text-right text-lg',
                    {
                      'cursor-not-allowed opacity-60': isLocked,
                      'text-[red]': disabled,
                    },
                  )}
                />
                <p>%</p>
              </div>
            </div>
            <label className="swap">
              <input type="checkbox" onClick={() => lockWeight(addressToken)} />
              <Lock className="swap-on h-5 w-5" />
              <Unlock className="swap-off h-5 w-5" />
            </label>
          </div>
        )
      })}

      <button
        disabled={disabled || !checkInput}
        onClick={onUpdateWeights}
        className="btn btn-primary w-full rounded-full"
      >
        {loading && <span className="loading loading-spinner" />}
        Update
      </button>
    </div>
  )
}

export default Weight
