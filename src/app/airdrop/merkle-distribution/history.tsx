import { useCallback, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { BN } from 'bn.js'
import { utils } from '@coral-xyz/anchor'
import { MerkleDistributor } from '@sentre/utility'
import { ParsedAccountData, PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import dayjs from 'dayjs'

import { ChevronDown } from 'lucide-react'
import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'
import UnclaimList from './unclaimList'

import { useDistributors, useMyDistributes } from '@/providers/airdrop.provider'
import {
  Distribute,
  useMerkleMetadata,
  useRevoke,
  useUtility,
} from '@/hooks/airdrop.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

const DEFAULT_AMOUNT = 4

const History = ({ type }: { type: Distribute }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)
  const { airdrops, vesting } = useMyDistributes()
  const history = type === Distribute.Airdrop ? airdrops : vesting
  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          History
          <span className="ml-2">{history.length}</span>
        </p>
      </div>
      <div className="overflow-x-auto">
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
              <HistoryItem address={address} key={address} />
            ))}
          </tbody>
        </table>
      </div>
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

export default History

const HistoryItem = ({ address }: { address: string }) => {
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
    <tr className="hover cursor-pointer">
      <td>{dayjs(value?.createdAt).format('DD/MM/YYYY, HH:mm')}</td>
      <td>
        {value?.unlockTime
          ? 'Immediately'
          : dayjs(value?.unlockTime).format('DD/MM/YYYY, HH:mm')}
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
