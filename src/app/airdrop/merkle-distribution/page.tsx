'use client'
import { useMemo, useState } from 'react'
import { Leaf } from '@sentre/utility'

import AirdropRow from './airdropRow'
import { ChevronDown } from 'lucide-react'

import { useDistributors, useMyReceivedList } from '@/providers/merkle.provider'
import { useReceiptStatus } from '@/hooks/airdrop.hook'
import { ReceiptState } from './statusTag'

export type ReceiveItem = {
  endedAt: number
  sender: string
  mintAddress: string
  status: ReceiptState
  distributor: string
  leaf: Leaf
}

export const FORMAT_DATE = 'DD/MM/YYYY, h:mm A'
const DEFAULT_AMOUNT = 4

export default function MerkleDistribution() {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  const distributors = useDistributors()
  const { receivedList } = useMyReceivedList()
  const getReceiptStatus = useReceiptStatus()
  const { airdrop } = useMemo(() => {
    const airdrop: ReceiveItem[] = []
    const vesting: ReceiveItem[][] = []

    for (const address in receivedList) {
      const { mint, endedAt, authority } = distributors[address]
      const leafs = receivedList[address]

      // Airdrop list
      if (leafs.length === 1) {
        const { startedAt, receiptAddress } = leafs[0]
        const status = getReceiptStatus(address, receiptAddress, startedAt)
        const method = status === ReceiptState.ready ? 'unshift' : 'push'
        airdrop[method]({
          status,
          distributor: address,
          mintAddress: mint.toBase58(),
          endedAt: endedAt.toNumber() * 1000,
          sender: authority.toBase58(),
          leaf: leafs[0],
        })
      }
      // Vesting list
      else {
        const vestingItem: ReceiveItem[] = []
        for (const leaf of leafs) {
          const { startedAt, receiptAddress } = leaf
          const status = getReceiptStatus(address, receiptAddress, startedAt)
          vestingItem.push({
            status,
            distributor: address,
            mintAddress: mint.toBase58(),
            endedAt: endedAt.toNumber() * 1000,
            sender: authority.toBase58(),
            leaf,
          })
        }
        vesting.push(vestingItem)
      }
    }
    return { airdrop, vesting }
  }, [distributors, getReceiptStatus, receivedList])

  return (
    <div className="flex flex-col gap-6">
      <h4>Dashboard</h4>
      <div className="card bg-base-100 p-4 gap-6">
        <div className="flex">
          <p>
            Airdrop receive
            <span className="ml-2">{airdrop.length}</span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>UNLOCK TIME</th>
                <th>EXPIRATION TIME</th>
                <th>SENDER</th>
                <th>TOKEN</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {airdrop.slice(0, showAirdrop).map((props, i) => (
                <AirdropRow key={i} {...props} />
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => setAmountAirdrop(showAirdrop + DEFAULT_AMOUNT)}
          disabled={showAirdrop >= airdrop.length}
          className="btn btn-ghost flex self-center"
        >
          <ChevronDown className="h-4 w-4" /> View more
        </button>
      </div>
    </div>
  )
}
