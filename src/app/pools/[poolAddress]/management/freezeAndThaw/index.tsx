import { Suspense, lazy, useState } from 'react'
import classNames from 'classnames'

import { usePoolByAddress } from '@/providers/pools.provider'

const ThawPool = lazy(() => import('./pool/thawPool'))
const FreezePool = lazy(() => import('./pool/freezePool'))
const FreezeAndThawToken = lazy(() => import('./token'))

const FreezeAndThaw = ({ poolAddress }: { poolAddress: string }) => {
  const [activeTab, setActiveTab] = useState('pool')
  const pool = usePoolByAddress(poolAddress)

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
      <Suspense>
        {activeTab === 'pool' && pool.state['initialized'] && (
          <FreezePool poolAddress={poolAddress} />
        )}
        {activeTab === 'pool' && pool.state['frozen'] && (
          <ThawPool poolAddress={poolAddress} />
        )}

        {activeTab === 'individual_token' && (
          <FreezeAndThawToken poolAddress={poolAddress} />
        )}
      </Suspense>
    </div>
  )
}

export default FreezeAndThaw
