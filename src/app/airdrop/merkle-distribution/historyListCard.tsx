import { useCallback, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { BN } from 'bn.js'
import { utils } from '@coral-xyz/anchor'
import { MerkleDistributor } from '@sentre/utility'
import { ParsedAccountData, PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import dayjs from 'dayjs'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'

import { useDistributors } from '@/providers/airdrop.provider'
import { useMerkleMetadata, useRevoke, useUtility } from '@/hooks/airdrop.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'
import UnclaimList from './unclaimList'

const DEFAULT_AMOUNT = 4

const HistoryListCard = ({ history }: { history: string[] }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  return (
    <div className="md:hidden flex flex-col justify-center gap-4">
      {history.slice(0, showAirdrop).map((address) => (
        <HistoryCard address={address} key={address} />
      ))}
      <button
        onClick={() => setAmountAirdrop(showAirdrop + DEFAULT_AMOUNT)}
        disabled={showAirdrop >= history.length}
        className="btn btn-ghost flex self-center"
      >
        <ChevronDown className="h-4 w-4" /> View more
      </button>
    </div>
  )
}

export default HistoryListCard

const HistoryCard = ({ address }: { address: string }) => {
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const distributors = useDistributors()
  const pushMessage = usePushMessage()
  const getMetadata = useMerkleMetadata()
  const { mint, total, endedAt } = distributors[address]

  const { connection } = useConnection()
  const utility = useUtility()

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

  const { value } = useAsync(async () => {
    const metadata = await getMetadata(address)
    const root = MerkleDistributor.fromBuffer(Buffer.from(metadata.data))
    const unlockTime = root.receipients[0].startedAt.toNumber() * 1000

    return { unlockTime, createdAt: metadata.createAt * 1000 }
  }, [address])

  const { value: remaining } = useAsync(async () => {
    if (!utility) return
    const treasurerAddress = await utility.deriveTreasurerAddress(address)
    const associated = await utils.token.associatedAddress({
      mint,
      owner: new PublicKey(treasurerAddress),
    })
    const { value } = await connection.getParsedAccountInfo(associated)
    if (!value) return '0'
    const data = value.data as ParsedAccountData
    return data.parsed.info.tokenAmount.amount || '0'
  }, [address, utility])

  const ok = useMemo(() => {
    const isEmptyTreasury = new BN(remaining).isZero()
    const validTime = endedAt.toNumber() * 1000 < Date.now()
    return !isEmptyTreasury && validTime
  }, [endedAt, remaining])

  return (
    <div className="card flex flex-col gap-4 bg-base-100">
      <div className="flex flex-row justify-between mb-4">
        <div className="flex gap-2 items-center">
          <MintLogo
            mintAddress={mint.toBase58()}
            className="w-7 h-7 rounded-full bg-base-300"
          />
          <div className="flex flex-row gap-1 text-base leading-5">
            <p>
              <MintAmount mintAddress={mint.toBase58()} amount={total} />
            </p>
            <MintSymbol mintAddress={mint.toBase58()} />
          </div>
        </div>
        <div className="flex gap-2">
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
          <UnclaimList distributeAddress={address} />
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <p>Created time</p>
        <p>{dayjs(value?.createdAt).format('DD/MM/YYYY, HH:mm')}</p>
      </div>
      <div className="flex flex-row justify-between">
        <p>Unlock time</p>
        <p>
          {value?.unlockTime
            ? 'Immediately'
            : dayjs(value?.unlockTime).format('DD/MM/YYYY, HH:mm')}
        </p>
      </div>
      <div className="flex h-4 cursor-pointer justify-center">
        <ChevronUp className="h-6 w-6" />
      </div>
      <div className="bg-base-300 w-full h-[1px] my-4" />
    </div>
  )
}
