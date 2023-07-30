'use client'
import { useCallback, useMemo, useState } from 'react'
import { redirect } from 'next/navigation'
import BN from 'bn.js'

import { MintLogo, MintSymbol } from '@/components/mint'
import EditRowBulkSender from './row'

import {
  useAirdropData,
  useAirdropDecimalized,
  useAirdropMintAddress,
} from '@/providers/airdrop.provider'
import { isAddress, numeric } from '@/helpers/utils'
import { usePushMessage } from '@/components/message/store'
import { useTvl } from '@/hooks/tvl.hook'
import { useMints } from '@/hooks/spl.hook'
import { decimalize, undecimalize } from '@/helpers/decimals'

export default function EditBulkSender() {
  const [loading, setLoading] = useState(false)
  const [newAmount, setNewAmount] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const { mintAddress } = useAirdropMintAddress()
  const { data } = useAirdropData()
  const { decimalized, setDecimalized } = useAirdropDecimalized()
  const pushMessage = usePushMessage()
  const [mint] = useMints([mintAddress])

  const onSend = useCallback(() => {
    try {
      setLoading(true)
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [pushMessage])

  const amount = useMemo(() => {
    if (mint?.decimals === undefined) return new BN(0)
    return data.reduce(
      (s, [_, a]) => decimalize(a, mint.decimals).add(s),
      new BN(0),
    )
  }, [data, mint?.decimals])
  const tvl = useTvl([{ mintAddress, amount }])

  if (!isAddress(mintAddress)) return redirect('/airdrop/bulk-sender')
  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12 card bg-base-200 p-2 flex flex-row gap-2 items-center">
        <MintLogo mintAddress={mintAddress} />
        <p className="font-bold flex-auto">
          <MintSymbol mintAddress={mintAddress} />
        </p>
        <label className="label cursor-pointer gap-2">
          <span className="label-text">With decimals?</span>
          <input
            type="checkbox"
            className="checkbox"
            checked={decimalized}
            onChange={(e) => setDecimalized(e.target.checked)}
          />
        </label>
      </div>
      <div className="col-span-full flex flex-col gap-2">
        {data.map(([address, amount], i) => (
          <EditRowBulkSender
            key={`${address}-${i}`}
            address={address}
            amount={amount}
          />
        ))}
        <EditRowBulkSender
          address={newAddress}
          onAddress={setNewAddress}
          amount={newAmount}
          onAmount={setNewAmount}
          toAdd
        />
      </div>
      <div className="col-span-full @container">
        <div className="stats stats-vertical @md:stats-horizontal w-full bg-base-200">
          <div className="stat">
            <div className="stat-title">Total receivers</div>
            <div className="stat-value">
              {numeric(data.length).format('0,0')}
            </div>
            <div className="stat-desc">Need to create 100k accounts</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total value</div>
            <div className="stat-value">{numeric(tvl).format('$0a.[00]')}</div>
            <div className="stat-desc">
              {numeric(undecimalize(amount, mint?.decimals || 0)).format(
                '0,0.[0000]',
              )}
              <span className="ml-1">
                <MintSymbol mintAddress={mintAddress} />
              </span>
            </div>
          </div>
        </div>
      </div>
      <button
        className="col-span-full btn btn-primary rounded-full"
        onClick={onSend}
        disabled={loading}
      >
        {loading && <span className="loading loading-spinner loading-sm" />}
        Send
      </button>
    </div>
  )
}
