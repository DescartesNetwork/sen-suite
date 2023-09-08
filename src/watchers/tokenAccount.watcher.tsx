'use client'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { KeyedAccountInfo } from '@solana/web3.js'

import { useSpl } from '@/hooks/spl.hook'
import { useTokenAccountStore } from '@/providers/tokenAccount.provider'

export default function TokenAccountWatcher() {
  const [watchId, setWatchId] = useState(0)
  const spl = useSpl()
  const { publicKey } = useWallet()
  const setTokenAccounts = useTokenAccountStore(
    ({ setTokenAccounts }) => setTokenAccounts,
  )
  const watchData = useCallback(async () => {
    if (!publicKey) return
    const watchId = spl.provider.connection.onProgramAccountChange(
      spl.programId,
      (accountInfo: KeyedAccountInfo) => {
        const buf = accountInfo.accountInfo.data
        const data = spl.coder.accounts.decode('account', buf)
        return setTokenAccounts({
          [data.mint.toBase58()]: data,
        })
      },
      'confirmed',
      [{ memcmp: { bytes: publicKey.toBase58(), offset: 32 } }],
    )
    setWatchId(watchId)
  }, [publicKey, spl, setTokenAccounts])

  useEffect(() => {
    if (watchId) return
    watchData()
    return () => {
      ;(async () => {
        if (!watchId) return
        spl.provider.connection.removeProgramAccountChangeListener(watchId)
        setWatchId(0)
      })()
    }
  }, [spl.provider.connection, watchData, watchId])

  return <Fragment />
}
