'use client'
import { useCallback, useMemo, useState } from 'react'
import { BN } from 'bn.js'
import { MerkleDistributor } from '@sentre/utility'
import dayjs from 'dayjs'

import { ChevronDown } from 'lucide-react'
import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'
import UnclaimList from './unclaimList'
import ExpandCard from '@/components/expandCard'

import { useDistributors, useMyDistributes } from '@/providers/airdrop.provider'
import {
  Distribute,
  useMerkleMetadata,
  useRemainingBalance,
  useRevoke,
} from '@/hooks/airdrop.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

const DEFAULT_AMOUNT = 4

export default function History({ type }: { type: Distribute }) {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)
  const { airdrops, vesting } = useMyDistributes()
  const history = type === Distribute.Airdrop ? airdrops : vesting
  return (
    <div className="@container/history card bg-base-100 grid grid-cols-12 p-4 gap-6">
      <div className="col-span-full flex">
        <p>
          History
          <span className="ml-2">{history.length}</span>
        </p>
      </div>

      {/* Mobile display */}
      <div className="col-span-full grid grid-cols-12 gap-4  @3xl/history:hidden">
        {history.slice(0, showAirdrop).map((address, i) => (
          <div key={address} className="col-span-full">
            <HistoryExpand address={address} expanded={!i} />
          </div>
        ))}
      </div>

      {/* Desktop display */}
      <div className="col-span-full hidden @3xl/history:block overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>CREATED AT</th>
              <th>UNLOCK DATE</th>
              <th>TOKEN</th>
              <th>TOTAL</th>
              <th>REMAINING</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, showAirdrop).map((address) => (
              <HistoryTableItem address={address} key={address} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="col-span-full flex justify-center">
        <button
          onClick={() => setAmountAirdrop(showAirdrop + DEFAULT_AMOUNT)}
          disabled={showAirdrop >= history.length}
          className="btn btn-ghost flex self-center"
        >
          <ChevronDown className="h-4 w-4" /> View more
        </button>
      </div>
    </div>
  )
}

const HistoryTableItem = ({ address }: { address: string }) => {
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const distributors = useDistributors()
  const pushMessage = usePushMessage()
  const metadata = useMerkleMetadata(address)
  const { mint, total, endedAt } = distributors[address]

  const remaining = useRemainingBalance(address)

  const revoke = useRevoke(address)
  const onRevoke = useCallback(async () => {
    try {
      setLoading(true)
      const txId = (await revoke()) || ''
      setDisabled(true)
      pushMessage(
        'alert-success',
        'Successfully revoke token. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [pushMessage, revoke])

  const time = useMemo(() => {
    if (!metadata) return
    const root = MerkleDistributor.fromBuffer(Buffer.from(metadata.data))
    const unlockTime = root.receipients[0].startedAt.toNumber() * 1000

    return { unlockTime, createdAt: metadata.createAt * 1000 }
  }, [metadata])

  const ok = useMemo(() => {
    const isEmptyTreasury = new BN(remaining).isZero()
    const validTime = endedAt.toNumber() * 1000 < Date.now()
    return !isEmptyTreasury && validTime
  }, [endedAt, remaining])

  return (
    <tr className="hover cursor-pointer">
      <td>{dayjs(time?.createdAt).format('DD/MM/YYYY, HH:mm')}</td>
      <td>
        {!time?.unlockTime
          ? 'Immediately'
          : dayjs(time?.unlockTime).format('DD/MM/YYYY, HH:mm')}
      </td>
      <td>
        <div className="flex gap-2 items-center">
          <MintLogo
            mintAddress={mint.toBase58()}
            className="w-6 h-6 rounded-full bg-base-300"
          />
          <MintSymbol mintAddress={mint.toBase58()} />
        </div>
      </td>
      <td>
        <MintAmount mintAddress={mint.toBase58()} amount={total} />
      </td>
      <td>
        <MintAmount mintAddress={mint.toBase58()} amount={new BN(remaining)} />
      </td>
      <td className="flex gap-2">
        {!endedAt.isZero() && (
          <button
            disabled={!ok || disabled || loading}
            className="btn btn-sm btn-ghost text-info"
            onClick={onRevoke}
          >
            {loading && <span className="loading loading-spinner loading-xs" />}
            REVOKE
          </button>
        )}
        <UnclaimList distributeAddress={address} />
      </td>
    </tr>
  )
}

const HistoryExpand = ({
  address,
  expanded,
}: {
  address: string
  expanded: boolean
}) => {
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const distributors = useDistributors()
  const pushMessage = usePushMessage()
  const metadata = useMerkleMetadata(address)
  const { mint, total, endedAt } = distributors[address]

  const remaining = useRemainingBalance(address)

  const revoke = useRevoke(address)
  const onRevoke = useCallback(async () => {
    try {
      setLoading(true)
      const txId = (await revoke()) || ''
      setDisabled(true)
      pushMessage(
        'alert-success',
        'Successfully revoke token. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [pushMessage, revoke])

  const time = useMemo(() => {
    if (!metadata) return
    const root = MerkleDistributor.fromBuffer(Buffer.from(metadata.data))
    const unlockTime = root.receipients[0].startedAt.toNumber() * 1000

    return { unlockTime, createdAt: metadata.createAt * 1000 }
  }, [metadata])

  const ok = useMemo(() => {
    const isEmptyTreasury = new BN(remaining).isZero()
    const validTime = endedAt.toNumber() * 1000 < Date.now()
    return !isEmptyTreasury && validTime
  }, [endedAt, remaining])

  return (
    <ExpandCard
      isExpand={expanded}
      header={
        <div className="flex gap-2 items-center justify-between">
          <div className="flex !gap-2 items-center">
            <MintLogo
              mintAddress={mint.toBase58()}
              className="w-6 h-6 rounded-full bg-base-300"
            />
            <p>
              <MintAmount mintAddress={mint.toBase58()} amount={total} />{' '}
              <MintSymbol mintAddress={mint.toBase58()} />
            </p>
          </div>
          {!endedAt.isZero() && (
            <button
              disabled={!ok || disabled || loading}
              className="btn btn-sm btn-ghost text-info"
              onClick={onRevoke}
            >
              {loading && (
                <span className="loading loading-spinner loading-xs" />
              )}
              REVOKE
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-2 ">
        <div className="flex gap-2 items-center justify-between">
          <p className="opacity-60">Created date</p>
          <p>{dayjs(time?.createdAt).format('DD/MM/YYYY, HH:mm')}</p>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <p className="opacity-60">Unlock date</p>
          <p>
            {time?.unlockTime
              ? 'Immediately'
              : dayjs(time?.unlockTime).format('DD/MM/YYYY, HH:mm')}
          </p>
        </div>
      </div>
    </ExpandCard>
  )
}
