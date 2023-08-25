'use client'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

import { useFarming } from '@/hooks/farming.hook'
import { useFarmingStore } from '@/providers/farming.provider'

export const FarmWatcher = () => {
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

export const DebtWatcher = () => {
  const [watchId, setWatchId] = useState(0)
  const farming = useFarming()
  const { publicKey } = useWallet()
  const upsertDebts = useFarmingStore(({ upsertDebts }) => upsertDebts)

  const filter = useMemo(() => {
    if (!publicKey) return []
    return [{ memcmp: { bytes: publicKey.toBase58(), offset: 40 } }]
  }, [publicKey])

  const watchData = useCallback(async () => {
    const { connection } = farming.program.provider
    const watchId = connection.onProgramAccountChange(
      farming.program.account.farm.programId,
      (info) => {
        const address = info.accountId.toBase58()
        const buffer = info.accountInfo.data
        const accountData = farming.program.coder.accounts.decode(
          'debt',
          buffer,
        )
        upsertDebts({ [address]: accountData })
      },
      'confirmed',
      filter,
    )
    setWatchId(watchId)
  }, [farming, filter, upsertDebts])

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

export const RewardWatcher = () => {
  const [watchId, setWatchId] = useState(0)
  const farming = useFarming()
  const upsertRewards = useFarmingStore(({ upsertRewards }) => upsertRewards)

  const watchData = useCallback(async () => {
    const { connection } = farming.program.provider
    const watchId = connection.onProgramAccountChange(
      farming.program.account.farm.programId,
      (info) => {
        const address = info.accountId.toBase58()
        const buffer = info.accountInfo.data
        const accountData = farming.program.coder.accounts.decode(
          'farmRewardMint',
          buffer,
        )
        upsertRewards({ [address]: accountData })
      },
      'confirmed',
    )
    setWatchId(watchId)
  }, [farming, upsertRewards])

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

export const BoostingWatcher = () => {
  const [watchId, setWatchId] = useState(0)
  const farming = useFarming()
  const upsertBoostings = useFarmingStore(
    ({ upsertBoostings }) => upsertBoostings,
  )

  const watchData = useCallback(async () => {
    const { connection } = farming.program.provider
    const watchId = connection.onProgramAccountChange(
      farming.program.account.farm.programId,
      (info) => {
        const address = info.accountId.toBase58()
        const buffer = info.accountInfo.data
        const accountData = farming.program.coder.accounts.decode(
          'farmBoostingCollection',
          buffer,
        )
        upsertBoostings({ [address]: accountData })
      },
      'confirmed',
    )
    setWatchId(watchId)
  }, [farming, upsertBoostings])

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

export default function FarmingWatcher() {
  return (
    <Fragment>
      <FarmWatcher />
      <DebtWatcher />
      <RewardWatcher />
      <BoostingWatcher />
    </Fragment>
  )
}
