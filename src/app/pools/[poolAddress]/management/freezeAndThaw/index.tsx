import { useMemo, useState } from 'react'
import classNames from 'classnames'

import FreezePool from './pool/freezePool'
import ThawPool from './pool/thawPool'
import FreezeAndThawToken from './token'

import { usePoolByAddress } from '@/providers/pools.provider'

const FreezeAndThaw = ({ poolAddress }: { poolAddress: string }) => {
  const [activeTab, setActiveTab] = useState('pool')
  const pool = usePoolByAddress(poolAddress)

  const renderedBodyComponent = useMemo(() => {
    if (activeTab === 'pool' && pool.state['initialized'])
      return <FreezePool poolAddress={poolAddress} />
    if (activeTab === 'pool' && pool.state['frozen'])
      return <ThawPool poolAddress={poolAddress} />

    return <FreezeAndThawToken poolAddress={poolAddress} />
  }, [activeTab, pool.state, poolAddress])

  return (
    <div className="flex flex-col gap-4">
      <div className="tabs tabs-boxed bg-inherit gap-4">
        <div
          onClick={() => setActiveTab('pool')}
          className={classNames('tab bg-base-200', {
            'tab-active': activeTab === 'pool',
          })}
        >
          Pool
        </div>
        <div
          onClick={() => setActiveTab('individual_token')}
          className={classNames('tab bg-base-200', {
            'tab-active': activeTab === 'individual_token',
          })}
        >
          Individual token
        </div>
      </div>
      <div>{renderedBodyComponent}</div>
    </div>
  )
}

export default FreezeAndThaw
