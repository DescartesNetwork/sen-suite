'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { useAsync } from 'react-use'
import {
  DistributorData,
  MerkleDistributor,
  ReceiptData,
  Leaf,
} from '@sentre/utility'
import { produce } from 'immer'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { env } from '@/configs/env'
import {
  Distribute,
  useMerkleMetadata,
  useParseMerkleType,
  useSenUtility,
} from '@/hooks/merkle.hook'
import { useWallet } from '@solana/wallet-adapter-react'

export type MerkleStore = {
  distributors: Record<string, DistributorData>
  upsertDistributor: (address: string, newDistributor: DistributorData) => void
  receipts: Record<string, ReceiptData>
  upsertReceipt: (address: string, newReceipt: ReceiptData) => void
}

export const useMerkleStore = create<MerkleStore>()(
  devtools(
    (set) => ({
      distributors: {},
      upsertDistributor: (address: string, distributor: DistributorData) =>
        set(
          produce<MerkleStore>(({ distributors }) => {
            distributors[address] = distributor
          }),
          false,
          'upsertDistributor',
        ),
      receipts: {},
      upsertReceipt: (address: string, receipt: ReceiptData) =>
        set(
          produce<MerkleStore>(({ receipts }) => {
            receipts[address] = receipt
          }),
          false,
          'upsertReceipt',
        ),
    }),
    {
      name: 'merkle',
      enabled: env === 'development',
    },
  ),
)

export default function MerkleProvider({ children }: { children: ReactNode }) {
  const utility = useSenUtility()
  const { publicKey } = useWallet()
  const upsertReceipt = useMerkleStore(({ upsertReceipt }) => upsertReceipt)
  const upsertDistributor = useMerkleStore(
    ({ upsertDistributor }) => upsertDistributor,
  )

  const fetchDistributors = useCallback(async () => {
    const { account } = utility.program
    const distributors = await account.distributor.all()
    for (const { publicKey, account: distributorData } of distributors) {
      const address = publicKey.toBase58()
      upsertDistributor(address, distributorData)
    }
  }, [upsertDistributor, utility.program])

  useEffect(() => {
    fetchDistributors()
  }, [fetchDistributors])

  const fetchReceipts = useCallback(async () => {
    if (!publicKey) return
    const { account } = utility.program
    const receipts = await account.receipt.all([
      { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
    ])
    for (const { publicKey, account: receiptData } of receipts) {
      const address = publicKey.toBase58()
      upsertReceipt(address, receiptData)
    }
  }, [publicKey, upsertReceipt, utility.program])

  useEffect(() => {
    fetchReceipts()
  }, [fetchReceipts])

  return <Fragment>{children}</Fragment>
}

/**
 * Get all distributors
 * @returns Distributors list
 */
export const useDistributors = () => {
  const distributors = useMerkleStore(({ distributors }) => distributors)
  return distributors
}

/**
 * Get all distributors
 * @returns Distributors list
 */
export const useMyReceivedList = () => {
  const distributors = useDistributors()
  const getMetadata = useMerkleMetadata()
  const parseMerkleType = useParseMerkleType()
  const { publicKey } = useWallet()

  const { value, error, loading } = useAsync(async () => {
    if (!publicKey) return []
    const walletAddress = publicKey.toBase58()
    const result: Leaf[][] = []

    for (const address in distributors) {
      const metadata = await getMetadata(address)
      const root = MerkleDistributor.fromBuffer(Buffer.from(metadata.data))
      const merkleType = parseMerkleType(root)
      const types = [Distribute.Airdrop, Distribute.Vesting]
      if (!merkleType || !types.includes(merkleType)) continue

      const recipient = root.receipients.filter(
        ({ authority }) => authority.toBase58() === walletAddress,
      )
      if (recipient.length) result.push(recipient)
    }

    return result
  }, [distributors, publicKey])

  return { receivedList: value, error, loading }
}

/**
 * Get all my receipts
 * @returns Receipts list
 */
export const useMyReceipts = () => {
  const myReceipts = useMerkleStore(({ receipts }) => receipts)
  return myReceipts
}
