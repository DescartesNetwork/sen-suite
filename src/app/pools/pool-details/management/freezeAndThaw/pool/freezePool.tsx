'use client'
import { useState } from 'react'
import { PoolStates } from '@sentre/senswap'

import { Snowflake } from 'lucide-react'
import CardDescription from './cardDescription'

import { solscan } from '@/helpers/explorers'
import { usePoolManagement } from '@/hooks/pool.hook'
import { usePushMessage } from '@/components/message/store'

export default function FreezePool({ poolAddress }: { poolAddress: string }) {
  const [loading, setLoading] = useState(false)

  const { freezePool } = usePoolManagement(poolAddress)
  const pushMessage = usePushMessage()

  const onFreezePool = async () => {
    setLoading(true)
    try {
      const txId = await freezePool()
      return pushMessage('alert-success', 'Successfully Freeze pool', {
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
        state={PoolStates.Initialized}
        description="Freezing a pool will prevent all actions until the pool has been unfreezed."
      />

      <button
        onClick={onFreezePool}
        className="btn btn-primary w-full rounded-full"
      >
        {loading ? (
          <span className="loading loading-spinner" />
        ) : (
          <Snowflake className="w-4 h-4" />
        )}
        Freeze Pool
      </button>
    </div>
  )
}
