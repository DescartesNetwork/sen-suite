'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { redirect } from 'next/navigation'
import BN from 'bn.js'
import { Keypair } from '@solana/web3.js'

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
import { useSendBulk } from '@/hooks/airdrop.hook'
import { solscan } from '@/helpers/explorers'

enum RowStatus {
  Good,
  BadAddress,
  Duplicated,
  BadAmount,
  ZeroAmount,
}

export default function SummaryBulkSender() {
  const [loading, setLoading] = useState(false)
  const [newAmount, setNewAmount] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const { mintAddress } = useAirdropMintAddress()
  const { data, setData } = useAirdropData()
  const { decimalized, setDecimalized } = useAirdropDecimalized()
  const pushMessage = usePushMessage()
  const [mint] = useMints([mintAddress])
  const sendBulk = useSendBulk(mintAddress)

  const decimals = useMemo(() => mint?.decimals, [mint?.decimals])
  const amount = useMemo(
    () =>
      data.reduce(
        (s, [_, a]) =>
          decimals === undefined ? new BN(0) : decimalize(a, decimals).add(s),
        new BN(0),
      ),
    [data, decimals],
  )
  const tvl = useTvl([{ mintAddress, amount }])

  const statuses = useMemo(
    () =>
      data.map(([address, amount], i) => {
        if (!isAddress(address)) return RowStatus.BadAddress
        if (Number(amount) < 0) return RowStatus.BadAmount
        if (Number(amount) === 0) return RowStatus.ZeroAmount
        if (
          data
            .map(([next], j) => next === address && i !== j)
            .reduce((a, b) => a || b, false)
        )
          return RowStatus.Duplicated
        return RowStatus.Good
      }),
    [data],
  )
  const errors = useMemo(
    () =>
      statuses
        .map((e) => e === RowStatus.BadAddress || e === RowStatus.BadAmount)
        .map((e) => (e ? 1 : 0))
        .reduce<number>((a, b) => a + b, 0),
    [statuses],
  )
  const warnings = useMemo(
    () =>
      statuses
        .map((e) => e === RowStatus.ZeroAmount || e === RowStatus.Duplicated)
        .map((e) => (e ? 1 : 0))
        .reduce<number>((a, b) => a + b, 0),
    [statuses],
  )

  const onDelete = useCallback(
    (i: number) => {
      const newData = [...data]
      newData.splice(i, 1)
      return setData(newData)
    },
    [data, setData],
  )

  const onAdd = useCallback(() => {
    const newData = [...data]
    newData.push([newAddress, newAmount])
    setData(newData)
    setNewAddress('')
    setNewAmount('')
  }, [data, setData, newAddress, newAmount])

  const onMergeDuplicates = useCallback(() => {
    if (decimals === undefined)
      return pushMessage('alert-error', 'Cannot read onchain data.')
    const mapping: Record<string, string[]> = {}
    data.forEach(([address, amount]) => {
      if (!mapping[address]) mapping[address] = []
      mapping[address].push(amount)
    })
    const newData = Object.keys(mapping).map((address) => [
      address,
      undecimalize(
        mapping[address].reduce(
          (a, b) => decimalize(b, decimals).add(a),
          new BN(0),
        ),
        decimals,
      ),
    ])
    return setData(newData)
  }, [data, setData, decimals, pushMessage])

  const onFilterZeros = useCallback(() => {
    if (decimals === undefined)
      return pushMessage('alert-error', 'Cannot read onchain data.')
    const newData = data.filter(
      ([_, amount]) => !decimalize(amount, decimals).isZero(),
    )
    return setData(newData)
  }, [data, setData, decimals, pushMessage])

  const onSend = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await sendBulk(data)
      pushMessage(
        'alert-success',
        'Successfully send bulks. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [data, pushMessage, sendBulk])

  useEffect(() => {
    if (data.length) return () => {}
    const newData = []
    const rand = () => Math.round(Math.random() * 10 ** 4) / 10 ** 4
    while (newData.length < 8) {
      let r = rand()
      const kp = new Keypair()
      newData.push([kp.publicKey.toBase58(), r.toString()])
      while (r >= 0.95) {
        r = rand()
        newData.push([kp.publicKey.toBase58(), r.toString()])
      }
    }
    setData(newData)
  }, [data, setData])

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
            index={String(i + 1)}
            address={address}
            amount={amount}
            onClick={() => onDelete(i)}
            error={
              statuses[i] === RowStatus.BadAddress ||
              statuses[i] === RowStatus.BadAmount
            }
            warning={
              statuses[i] === RowStatus.Duplicated ||
              statuses[i] === RowStatus.ZeroAmount
            }
          />
        ))}
        <EditRowBulkSender
          address={newAddress}
          onAddress={setNewAddress}
          amount={newAmount}
          onAmount={setNewAmount}
          onClick={onAdd}
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
            {errors > 0 && (
              <div className="stat-desc">
                <span className="text-error font-bold">{`${errors} error(s)`}</span>
              </div>
            )}
            {warnings > 0 && (
              <div className="stat-desc">
                <span className="text-warning font-bold">{`${warnings} warning(s)`}</span>
              </div>
            )}
            {!errors && !warnings && (
              <div className="stat-desc">
                <span className="text-success font-bold">Optimized</span>
              </div>
            )}
            <div className="stat-actions">
              <button
                className="btn btn-xs btn-accent"
                onClick={onMergeDuplicates}
                disabled={!statuses.find((e) => e === RowStatus.Duplicated)}
              >
                Merge duplicates
              </button>
            </div>
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
            <div className="stat-actions">
              <button
                className="btn btn-xs btn-accent"
                onClick={onFilterZeros}
                disabled={!statuses.find((e) => e === RowStatus.ZeroAmount)}
              >
                Remove zeros
              </button>
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
