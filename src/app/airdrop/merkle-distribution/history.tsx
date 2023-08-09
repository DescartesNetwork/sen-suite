import { useState } from 'react'
import { useAsync } from 'react-use'
import { BN } from 'bn.js'
import { utils } from '@coral-xyz/anchor'
import { MerkleDistributor } from '@sentre/utility'
import { ParsedAccountData, PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import dayjs from 'dayjs'

import { ChevronDown } from 'lucide-react'
import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'

import { useDistributors, useMyDistributes } from '@/providers/merkle.provider'
import { Distribute, useMerkleMetadata, useUtility } from '@/hooks/airdrop.hook'

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
  const distributors = useDistributors()
  const getMetadata = useMerkleMetadata()

  const { connection } = useConnection()
  const utility = useUtility()

  const { mint, total } = distributors[address]

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

    return value?.data as ParsedAccountData
  }, [address, utility])

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
        <MintAmount
          mintAddress={mint.toBase58()}
          amount={new BN(remaining?.parsed.info.tokenAmount.amount || 0)}
        />
      </td>
      <td>
        <button className="btn btn-sm btn-ghost text-info">SHARE</button>
      </td>
    </tr>
  )
}
