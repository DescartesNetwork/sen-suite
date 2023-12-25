'use client'
import { Fragment, useCallback, useEffect, useState } from 'react'

import { useSenswap } from '@/hooks/pool.hook'
import { usePoolStore } from '@/providers/pools.provider'

const PoolWatcher = () => {
  const [watchId, setWatchId] = useState(0)
  const senswap = useSenswap()
  const upsertPool = usePoolStore(({ upsertPool }) => upsertPool)

  const watchData = useCallback(async () => {
    const { connection } = senswap.program.provider
    const watchId = connection.onProgramAccountChange(
      senswap.program.account.pool.programId,
      (info) => {
        const address = info.accountId.toBase58()
        const buffer = info.accountInfo.data
        const accountData = senswap.program.coder.accounts.decode(
          'pool',
          buffer,
        )
        upsertPool(address, accountData)
      },
      'confirmed',
    )
    setWatchId(watchId)
  }, [senswap, upsertPool])

  useEffect(() => {
    if (watchId) return
    watchData()
    return () => {
      ;(async () => {
        if (!watchId) return
        const { connection } = senswap.program.provider
        await connection.removeProgramAccountChangeListener(watchId)
        setWatchId(0)
      })()
    }
  }, [senswap, watchData, watchId])
  return <Fragment />
}

export default PoolWatcher
