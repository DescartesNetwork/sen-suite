import { useCallback, useMemo, useState } from 'react'
import dayjs from 'dayjs'

import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'

import { ReceiveItem } from './page'
import { shortenAddress } from '@/helpers/utils'
import { useClaim } from '@/hooks/airdrop.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

export enum ReceiptState {
  waiting = 'Waiting',
  ready = 'Ready',
  claimed = 'Claimed',
  expired = 'Expired',
  loading = 'Loading',
}

const STATUS_COLOR: Record<ReceiptState, string> = {
  Waiting: '#D4B106',
  Ready: '#03A326',
  Claimed: '#40A9FF',
  Expired: '#F9575E',
  Loading: '#F4F5F5',
}

const StatusTag = ({ state }: { state?: ReceiptState }) => {
  const tagColor = useMemo(() => {
    const color = !state
      ? STATUS_COLOR[ReceiptState.loading]
      : STATUS_COLOR[state]
    return color
  }, [state])

  return (
    <div
      className="px-2 py-1 border rounded-lg text-center"
      style={{ color: tagColor, borderColor: tagColor }}
    >
      {state}
    </div>
  )
}

const RewardCard = (props: ReceiveItem) => {
  const { leaf, endedAt, mintAddress, sender, status } = props
  const [loading, setLoading] = useState(false)
  const pushMessage = usePushMessage()

  const startTime = leaf.startedAt.toNumber() * 1000

  const claim = useClaim(props.distributor, leaf)
  const onClaim = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await claim()
      pushMessage(
        'alert-success',
        'Successfully claim. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [claim, pushMessage])

  return (
    <tr className="hover cursor-pointer">
      <td>
        {!startTime
          ? 'Immediately'
          : dayjs(startTime).format('DD/MM/YYYY, HH:mm')}
      </td>
      <td>
        {!endedAt ? 'Unlimited' : dayjs(endedAt).format('DD/MM/YYYY, HH:mm')}
      </td>
      <td>{shortenAddress(sender)}</td>
      <td>
        <div className="flex gap-2 items-center">
          <MintLogo
            mintAddress={mintAddress}
            className="w-6 h-6 rounded-full bg-base-300"
          />
          <MintSymbol mintAddress={mintAddress} />
        </div>
      </td>
      <td>
        <MintAmount mintAddress={mintAddress} amount={leaf.amount} />
      </td>
      <td>
        <StatusTag state={status} />
      </td>
      <td>
        <button
          className="col-span-full btn btn-primary btn-sm"
          onClick={onClaim}
          disabled={status !== ReceiptState.ready || loading}
        >
          {loading && <span className="loading loading-spinner loading-xs" />}
          Claim
        </button>
      </td>
    </tr>
  )
}

export default RewardCard
