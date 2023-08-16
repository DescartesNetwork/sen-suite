import { useCallback, useMemo, useState } from 'react'
import { BN } from 'bn.js'
import { ReceiptData } from '@sentre/utility'
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

  return (
    <div className="collapse bg-base-100 md:hidden rounded-none">
      <input type="checkbox" className="peer" />
      <div className="collapse-title p-0 flex flex-col gap-4">
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
      </div>
      <div className="collapse-content p-0 gap-4 mt-5">
        <div className="flex flex-row justify-between">
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
      <div className=" bg-base-300 w-full h-[1px] my-4" />
    </div>
  )
}

export default RewardCard
