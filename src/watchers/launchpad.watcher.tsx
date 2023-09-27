'use client'
import { Fragment, useCallback, useEffect, useState } from 'react'

import { useLaunchpadProgram } from '@/hooks/launchpad.hook'
import { useLaunchpadStore } from '@/providers/launchpad.provider'

export const ChequeWatcher = () => {
  const [watchId, setWatchId] = useState(0)
  const launchpad = useLaunchpadProgram()
  const upsertCheque = useLaunchpadStore(({ upsertCheque }) => upsertCheque)

  const watchData = useCallback(async () => {
    const { connection } = launchpad.program.provider
    const watchId = connection.onProgramAccountChange(
      launchpad.program.account.cheque.programId,
      (info) => {
        const address = info.accountId.toBase58()
        const buffer = info.accountInfo.data
        const accountData = launchpad.program.coder.accounts.decode(
          'cheque',
          buffer,
        )
        upsertCheque(address, accountData)
      },
      'confirmed',
    )
    setWatchId(watchId)
  }, [launchpad, upsertCheque])

  useEffect(() => {
    if (watchId) return
    watchData()
    return () => {
      ;(async () => {
        if (!watchId) return
        const { connection } = launchpad.program.provider
        await connection.removeProgramAccountChangeListener(watchId)
        setWatchId(0)
      })()
    }
  }, [launchpad.program.provider, watchData, watchId])

  return <Fragment />
}
export const LaunchpadWatcher = () => {
  const [watchId, setWatchId] = useState(0)
  const launchpad = useLaunchpadProgram()
  const upsertLaunchpad = useLaunchpadStore(
    ({ upsertLaunchpad }) => upsertLaunchpad,
  )

  const watchData = useCallback(async () => {
    const { connection } = launchpad.program.provider
    const watchId = connection.onProgramAccountChange(
      launchpad.program.account.launchpad.programId,
      (info) => {
        const address = info.accountId.toBase58()
        const buffer = info.accountInfo.data
        const accountData = launchpad.program.coder.accounts.decode(
          'launchpad',
          buffer,
        )
        upsertLaunchpad(address, accountData)
      },
      'confirmed',
    )
    setWatchId(watchId)
  }, [launchpad, upsertLaunchpad])

  useEffect(() => {
    if (watchId) return
    watchData()
    return () => {
      ;(async () => {
        if (!watchId) return
        const { connection } = launchpad.program.provider
        await connection.removeProgramAccountChangeListener(watchId)
        setWatchId(0)
      })()
    }
  }, [launchpad.program.provider, watchData, watchId])

  return <Fragment />
}

export default function Watcher() {
  return (
    <Fragment>
      <LaunchpadWatcher />
      <ChequeWatcher />
    </Fragment>
  )
}
