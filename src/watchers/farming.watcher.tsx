'use client'
import { Fragment, useCallback, useEffect, useState } from 'react'

import { useFarming } from '@/hooks/farming.hook'
import { useFarmingStore } from '@/providers/farming.provider'

const FarmingWatcher = () => {
  const [watchId, setWatchId] = useState(0)
  const farming = useFarming()
  const upsertFarms = useFarmingStore(({ upsertFarms }) => upsertFarms)

  const watchData = useCallback(async () => {
    const { connection } = farming.program.provider
    const watchId = connection.onProgramAccountChange(
      farming.program.account.farm.programId,
      (info) => {
        const address = info.accountId.toBase58()
        const buffer = info.accountInfo.data
        const accountData = farming.program.coder.accounts.decode(
          'farm',
          buffer,
        )
        console.log('accountData', accountData)
        upsertFarms({ [address]: accountData })
      },
      'confirmed',
    )
    setWatchId(watchId)
  }, [farming, upsertFarms])

  useEffect(() => {
    if (watchId) return
    watchData()
    return () => {
      ;(async () => {
        if (!watchId) return
        const { connection } = farming.program.provider
        await connection.removeProgramAccountChangeListener(watchId)
        setWatchId(0)
      })()
    }
  }, [farming, watchData, watchId])

  return <Fragment />
}

export default FarmingWatcher
