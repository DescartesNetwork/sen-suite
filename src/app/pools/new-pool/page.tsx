'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PoolState } from '@senswap/balancer'
import { useRouter } from 'next/navigation'
import classNames from 'classnames'

import { ChevronLeft } from 'lucide-react'
import SetupToken from './setupToken'
import AddLiquidity from './addLiquidity'
import PoolOverview from './poolOverview'

import { usePools } from '@/providers/pools.provider'

const SET_UP = 0
const ADD_LIQUIDITY = 1
const CONFIRM = 2

export default function NewPool() {
  const [step, setStep] = useState(SET_UP)
  const [poolAddress, setPoolAddress] = useState('')
  const pools = usePools()
  const { publicKey } = useWallet()
  const { push } = useRouter()

  const fetchProcessStep = useCallback(() => {
    if (poolAddress || !publicKey) return
    for (const poolAddress in pools) {
      const { authority, state } = pools[poolAddress]
      if (!authority.equals(publicKey)) continue
      if (!(state as PoolState)['uninitialized']) continue
      setStep(ADD_LIQUIDITY)
      return setPoolAddress(poolAddress)
    }
    return setPoolAddress('')
  }, [poolAddress, pools, publicKey])

  const renderContent = useMemo(() => {
    switch (step) {
      case SET_UP:
        return (
          <SetupToken
            onNext={() => setStep(ADD_LIQUIDITY)}
            setPoolAddress={setPoolAddress}
          />
        )
      case ADD_LIQUIDITY:
        return <AddLiquidity setStep={setStep} poolAddress={poolAddress} />
      case CONFIRM:
        return <PoolOverview poolAddress={poolAddress} />
    }
  }, [poolAddress, step])

  useEffect(() => {
    fetchProcessStep()
  }, [fetchProcessStep])

  return (
    <div className="w-full max-w-[660px] card bg-base-100 rounded-3xl p-6 grid grid-cols-12 gap-6">
      <div className="col-span-full flex justify-between items-center">
        <button
          onClick={() => push('/pools')}
          className="btn btn-circle btn-sm"
        >
          <ChevronLeft />
        </button>
        <h5>New Pool</h5>
      </div>
      <div className="col-span-full">
        <ul className="steps w-full">
          <li
            className={classNames('step', { 'step-primary': step >= SET_UP })}
          >
            Select token & weights
          </li>
          <li
            className={classNames('step', {
              'step-primary': step >= ADD_LIQUIDITY,
            })}
          >
            Set liquidity
          </li>
          <li
            className={classNames('step', { 'step-primary': step >= CONFIRM })}
          >
            Confirm
          </li>
        </ul>
      </div>
      <div className="col-span-full">{renderContent}</div>
    </div>
  )
}
