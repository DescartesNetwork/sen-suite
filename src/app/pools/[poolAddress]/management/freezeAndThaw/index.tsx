import { useState } from 'react'

import classNames from 'classnames'
import { usePoolByAddress } from '@/providers/pools.provider'
import FreezePool from './pool/freezePool'
import ThawPool from './pool/thawPool'
import { FreezeAndThawToken } from './freezeAndThawToken'

const FreezeAndThaw = ({ poolAddress }: { poolAddress: string }) => {
  const [activeTab, setActiveTab] = useState('pool')
  const pool = usePoolByAddress(poolAddress)

  const selectTab = (tabName: string) => {
    setActiveTab(tabName)
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="tabs tabs-boxed bg-inherit gap-4">
        <div
          onClick={() => selectTab('pool')}
          className={classNames('tab bg-base-200', {
            'tab-active': activeTab === 'pool',
          })}
        >
          Pool
        </div>
        <div
          onClick={() => selectTab('individual_token')}
          className={classNames('tab bg-base-200', {
            'tab-active': activeTab === 'individual_token',
          })}
        >
          Individual token
        </div>
      </div>

      <div className={`${activeTab === 'pool' ? 'block' : 'hidden'}`}>
        {pool.state['initialized'] && <FreezePool poolAddress={poolAddress} />}
        {pool.state['frozen'] && <ThawPool poolAddress={poolAddress} />}
      </div>
      <div
        className={`${activeTab === 'individual_token' ? 'block' : 'hidden'}`}
      >
        <FreezeAndThawToken poolAddress={poolAddress} />
      </div>
    </div>
  )
}

export default FreezeAndThaw
