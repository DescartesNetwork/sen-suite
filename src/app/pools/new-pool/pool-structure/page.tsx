'use client'
import { useCallback, useMemo, useState } from 'react'
import { isAddress } from '@sentre/senswap'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

import { AlertTriangle, Plus } from 'lucide-react'
import LiquiditySelection from './liquiditySelection'
import Overview from './overview'

import { useNewPoolStore } from '@/providers/newPool.provider'
import { usePushMessage } from '@/components/message/store'
import { useInitializePool } from '@/hooks/pool.hook'
import { solscan } from '@/helpers/explorers'

export enum PoolInitializationError {
  NoError = '',
  MinimumTwoTokens = 'The pool MUST include at least 2 tokens.',
  MaximumEightTokens = 'The pool MUST NOT exceed 8 tokens.',
  TooLowWeight = 'The weight MUST be greater than or equal to 10%.',
  InvalidMintAddress = 'There is an invalid token. Please review your token list and try again.',
  DuplicatedMintAddress = 'Duplicated tokens. Please delete one of them and try again.',
  InvalidTotalWeights = 'The pool weights MUST be equal to 100% in total.',
}

export default function PoolStructure() {
  const [loading, setLoading] = useState(false)
  const structure = useNewPoolStore(({ structure }) => structure)
  const setStructure = useNewPoolStore(({ setStructure }) => setStructure)
  const { push } = useRouter()
  const pushMessage = usePushMessage()
  const initializePool = useInitializePool()

  const onMintAddress = useCallback(
    (index: number, mintAddress: string) => {
      const newStructure = [...structure]
      newStructure[index].mintAddress = mintAddress
      return setStructure(newStructure)
    },
    [structure, setStructure],
  )

  const onWeight = useCallback(
    (index: number, weight: number) => {
      const newStructure = [...structure]
      newStructure[index].weight = weight
      return setStructure(newStructure)
    },
    [structure, setStructure],
  )

  const onDelete = useCallback(
    (index: number) => {
      const newStructure = [...structure]
      newStructure.splice(index, 1)
      return setStructure(newStructure)
    },
    [structure, setStructure],
  )

  const onAdd = useCallback(() => {
    const newStructure = [...structure]
    newStructure.push({
      mintAddress: '',
      weight: 10,
    })
    return setStructure(newStructure)
  }, [structure, setStructure])

  const error = useMemo(() => {
    if (structure.length < 2) return PoolInitializationError.MinimumTwoTokens
    if (structure.length > 8) return PoolInitializationError.MaximumEightTokens
    if (
      structure.reduce(
        (duplicated, { mintAddress }) => duplicated || !isAddress(mintAddress),
        false,
      )
    )
      return PoolInitializationError.InvalidMintAddress
    if (
      structure.reduce(
        (duplicated, { mintAddress: addr }, i, all) =>
          duplicated ||
          all.findIndex(({ mintAddress }) => addr === mintAddress) !== i,
        false,
      )
    )
      return PoolInitializationError.DuplicatedMintAddress
    if (structure.reduce((low, { weight }) => low || weight < 10, false))
      return PoolInitializationError.TooLowWeight
    if (structure.reduce((sum, { weight }) => sum + weight, 0) !== 100)
      return PoolInitializationError.InvalidTotalWeights
    return PoolInitializationError.NoError
  }, [structure])

  const onNext = useCallback(async () => {
    try {
      setLoading(true)
      if (error) throw new Error(error)
      const { txId, poolAddress } = await initializePool()
      pushMessage(
        'alert-success',
        'Successfully initialized a pool. Click here to view the transaction details.',
        {
          onClick: () => window.open(solscan(txId), '_blank'),
        },
      )
      push(`/pools/new-pool/set-liquidity?poolAddress=${poolAddress}`)
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [error, pushMessage, initializePool, push])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full card bg-base-200 rounded-lg p-4">
        <Overview />
      </div>
      <div className="col-span-full card bg-base-200 rounded-lg px-6 py-4 grid grid-cols-12 gap-2">
        <div className="col-span-full flex flex-row items-center mt-2">
          <p className="flex-auto text-sm font-bold opacity-60 ml-10">Token</p>
          <p className="text-sm font-bold opacity-60 mr-12">Weight</p>
        </div>
        <div className="col-span-full grid grid-cols-12 gap-0">
          {structure.map(({ mintAddress, weight }, i) => (
            <div
              key={mintAddress}
              className="col-span-full grid grid-cols-12 gap-0"
            >
              <span
                className={clsx('col-span-full divider divider-vertical m-0', {
                  hidden: !i,
                })}
              />
              <div className="col-span-full">
                <LiquiditySelection
                  mintAddress={mintAddress}
                  onMintAddress={(mintAddress) => onMintAddress(i, mintAddress)}
                  weight={weight}
                  onWeight={(weight) => onWeight(i, weight)}
                  onDelete={() => onDelete(i)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="col-span-full flex flex-row justify-center">
          <button className="btn rounded-full" onClick={onAdd}>
            <Plus className="h-4 w-4" /> Add More
          </button>
        </div>
      </div>
      <div
        role="alert"
        className={clsx('col-span-full alert alert-error', {
          hidden: !error,
        })}
      >
        <AlertTriangle className="h-4 w-4" />
        <span>{error}</span>
      </div>
      <button
        className="col-span-6 btn"
        onClick={() => push('/pools')}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        className="col-span-6 btn btn-primary"
        onClick={onNext}
        disabled={!!error || loading}
      >
        <span
          className={clsx('loading loading-spinner', { hidden: !loading })}
        />
        Next
      </button>
    </div>
  )
}
