'use client'
import { useMemo } from 'react'
import { Leaf } from '@sentre/utility'

import AirdropList from './airdropList'
import VestingList from './vestingList'
import Heros from './heros'

import { useDistributors, useMyReceivedList } from '@/providers/merkle.provider'
import { useReceiptStatus } from '@/hooks/airdrop.hook'
import { ReceiptState } from './rewardCard'

export type ReceiveItem = {
  endedAt: number
  sender: string
  mintAddress: string
  receiptAddress: string
  status: ReceiptState
  distributor: string
  leaf: Leaf
}

export default function MerkleDistribution() {
  const distributors = useDistributors()
  const { receivedList } = useMyReceivedList()
  const getReceiptStatus = useReceiptStatus()
  const { airdrops, vesting } = useMemo(() => {
    const airdrops: ReceiveItem[] = []
    const vesting: ReceiveItem[][] = []

    for (const address in receivedList) {
      const { mint, endedAt, authority } = distributors[address]
      const leafs = receivedList[address]

      // Airdrop list
      if (leafs.length === 1) {
        const { startedAt, receiptAddress } = leafs[0]
        const status = getReceiptStatus(address, receiptAddress, startedAt)
        const method = status === ReceiptState.ready ? 'unshift' : 'push'
        airdrops[method]({
          status,
          distributor: address,
          mintAddress: mint.toBase58(),
          endedAt: endedAt.toNumber() * 1000,
          sender: authority.toBase58(),
          leaf: leafs[0],
          receiptAddress,
        })
      }
      // Vesting list
      else {
        const vestingItem: ReceiveItem[] = []
        for (const leaf of leafs) {
          const { startedAt, receiptAddress } = leaf
          const status = getReceiptStatus(address, receiptAddress, startedAt)
          const method = status === ReceiptState.ready ? 'unshift' : 'push'
          vestingItem[method]({
            status,
            distributor: address,
            mintAddress: mint.toBase58(),
            endedAt: endedAt.toNumber() * 1000,
            sender: authority.toBase58(),
            leaf,
            receiptAddress,
          })
        }
        const isReady = vestingItem.find(
          ({ status }) => status === ReceiptState.ready,
        )
        const method = isReady ? 'unshift' : 'push'
        vesting[method](vestingItem)
      }
    }
    return { airdrops, vesting }
  }, [distributors, getReceiptStatus, receivedList])

  return (
    <div className="flex flex-col gap-6">
      <h4>Dashboard</h4>
      <Heros />
      <AirdropList airdrops={airdrops} />
      <VestingList vesting={vesting} />
    </div>
  )
}
