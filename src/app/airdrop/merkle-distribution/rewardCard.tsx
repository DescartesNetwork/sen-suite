import { useCallback, useMemo, useState } from 'react'
import { BN } from 'bn.js'
import { Leaf, ReceiptData } from '@sentre/utility'
import { PublicKey } from '@solana/web3.js'
import dayjs from 'dayjs'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'

import { ReceiveItem } from './page'
import { shortenAddress } from '@/helpers/utils'
import { useClaim } from '@/hooks/airdrop.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'
import { useAirdropStore } from '@/providers/airdrop.provider'

type PropsCard = {
  onClaim?: () => Promise<void>
  loading: boolean
  leaf: Leaf
  startTime: number
  endedAt: number
  mintAddress: string
  sender: string
  status: ReceiptState
}

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

export const StatusTag = ({ state }: { state?: ReceiptState }) => {
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
  const { leaf, endedAt, mintAddress, sender, status, receiptAddress } = props
  const [loading, setLoading] = useState(false)
  const pushMessage = usePushMessage()
  const upsertReceipt = useAirdropStore(({ upsertReceipt }) => upsertReceipt)
  const widthScreen = window.innerWidth

  const startTime = leaf.startedAt.toNumber() * 1000

  const claim = useClaim(props.distributor, leaf)
  const onClaim = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await claim()

      const receiptData: ReceiptData = {
        amount: leaf.amount,
        authority: leaf.authority,
        salt: Array.from(leaf.salt),
        startedAt: leaf.startedAt,
        claimedAt: new BN(Date.now() / 1000),
        distributor: new PublicKey(props.distributor),
      }
      upsertReceipt(receiptAddress, receiptData)

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
  }, [
    claim,
    leaf,
    props.distributor,
    pushMessage,
    receiptAddress,
    upsertReceipt,
  ])

  return widthScreen >= 768 ? (
    <CardTable
      onClaim={onClaim}
      loading={loading}
      leaf={leaf}
      startTime={startTime}
      endedAt={endedAt}
      mintAddress={mintAddress}
      sender={sender}
      status={status}
    />
  ) : (
    <Card
      onClaim={onClaim}
      loading={loading}
      leaf={leaf}
      startTime={startTime}
      endedAt={endedAt}
      mintAddress={mintAddress}
      sender={sender}
      status={status}
    />
  )
}

export default RewardCard

const Card = ({
  onClaim,
  loading,
  leaf,
  startTime,
  endedAt,
  mintAddress,
  sender,
  status,
}: PropsCard) => {
  return (
    <div className="flex flex-col bg-base-100 rounded-none md:hidden gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex gap-2 items-center">
          <MintLogo
            mintAddress={mintAddress}
            className="w-7 h-7 rounded-full bg-base-300"
          />
          <div className="flex flex-row gap-1 text-base">
            <p>
              <MintAmount mintAddress={mintAddress} amount={leaf.amount} />
            </p>
            <MintSymbol mintAddress={mintAddress} />
          </div>
        </div>

        <StatusTag state={status} />
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex items-center">
          <p>Sender: {shortenAddress(sender)}</p>
        </div>
        <button
          className="col-span-full btn btn-primary btn-sm"
          onClick={onClaim}
          disabled={status !== ReceiptState.ready || loading}
        >
          {loading && <span className="loading loading-spinner loading-xs" />}
          Claim
        </button>
      </div>
      <div className="collapse rounded-none">
        <input type="checkbox" className="peer absolute bottom-0" />
        <div className="collapse-content row-start-1 p-0 gap-4 h-0 peer-checked:h-16">
          <div className="flex flex-row justify-between mt-2">
            <p>Unlock time</p>
            <p>
              {!startTime
                ? 'Immediately'
                : dayjs(startTime).format('DD/MM/YYYY, HH:mm')}
            </p>
          </div>
          <div className="flex flex-row justify-between">
            <p>Expiration time</p>
            <p>
              {!endedAt
                ? 'Unlimited'
                : dayjs(endedAt).format('DD/MM/YYYY, HH:mm')}
            </p>
          </div>
        </div>
        <ChevronUp className="hidden peer-checked:block h-6 w-6 mx-auto" />
        <ChevronDown className="peer-checked:hidden h-6 w-6 mx-auto" />
      </div>

      <div className=" bg-base-300 w-full h-[1px] my-4" />
    </div>
  )
}

const CardTable = ({
  onClaim,
  loading,
  leaf,
  startTime,
  endedAt,
  mintAddress,
  sender,
  status,
}: PropsCard) => {
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
