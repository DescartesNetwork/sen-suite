'use client'
import { Fragment, useCallback, useEffect, useState } from 'react'

import { useBalancer } from '@/hooks/pool.hook'
import { usePoolStore } from '@/providers/pools.provider'

const PoolWatcher = () => {
  const [watchId, setWatchId] = useState(0)
  const balancer = useBalancer()
  const upsertPool = usePoolStore(({ upsertPool }) => upsertPool)

  const watchData = useCallback(async () => {
    const { connection } = balancer.program.provider
    const watchId = connection.onProgramAccountChange(
      balancer.program.account.pool.programId,
      (info) => {
        const address = info.accountId.toBase58()
        const buffer = info.accountInfo.data
        const accountData = balancer.program.coder.accounts.decode(
          'pool',
          buffer,
        )
        upsertPool(address, accountData)
      },
      'confirmed',
    )
    setWatchId(watchId)
  }, [balancer, upsertPool])

  useEffect(() => {
    if (watchId) return
    watchData()
    return () => {
      ;(async () => {
        if (!watchId) return
        const { connection } = balancer.program.provider
        await connection.removeProgramAccountChangeListener(watchId)
        setWatchId(0)
      })()
    }
  }, [balancer, watchData, watchId])
  return <Fragment />
}

export default PoolWatcher
