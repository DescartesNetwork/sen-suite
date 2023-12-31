'use client'
import { useState } from 'react'
import { PoolStates } from '@sentre/senswap'

import CardDescription from './cardDescription'

import { solscan } from '@/helpers/explorers'
import { usePoolManagement } from '@/hooks/pool.hook'
import { usePushMessage } from '@/components/message/store'

export default function ThawPool({ poolAddress }: { poolAddress: string }) {
  const [loading, setLoading] = useState(false)

  const { thawPool } = usePoolManagement(poolAddress)
  const pushMessage = usePushMessage()

  const onThawPool = async () => {
    setLoading(true)
    try {
      const txId = await thawPool()
      return pushMessage('alert-success', 'Successfully Unfreeze pool', {
        onClick: () => window.open(solscan(txId || ''), '_blank'),
      })
    } catch (err: any) {
      pushMessage('alert-error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <CardDescription
        state={PoolStates.Frozen}
        description="Unfreeze a pool will active all actions"
      />

      <button
        onClick={onThawPool}
        className="btn btn-primary w-full rounded-full"
      >
        {loading && <span className="loading loading-spinner" />}
        Unfreeze Pool
      </button>
    </div>
  )
}
