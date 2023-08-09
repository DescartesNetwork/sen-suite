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
import parseDuration from 'parse-duration'

import {
  Distribute,
  useMerkleMetadata,
  useParseMerkleType,
  useUtility,
} from '@/hooks/airdrop.hook'
import { useWallet } from '@solana/wallet-adapter-react'
import { env } from '@/configs/env'

export type RecipientData = {
  address: string
  amount: string
  unlockTime: number
}

export type Configs = {
  unlockTime: number
  expiration: number
  tgePercent: number
  tgeTime: number
  frequency: number
  distributeIn: number
  cliff: number
}

const defaultConfigs: Configs = {
  cliff: parseDuration('1month')!,
  distributeIn: parseDuration('6months')!,
  expiration: 0,
  frequency: parseDuration('1month')!,
  tgePercent: 0,
  tgeTime: 0,
  unlockTime: Date.now(),
}

export type MerkleStore = {
  distributors: Record<string, DistributorData>
  upsertDistributor: (address: string, newDistributor: DistributorData) => void
  receipts: Record<string, ReceiptData>
  upsertReceipt: (address: string, newReceipt: ReceiptData) => void
  recipients: RecipientData[]
  setRecipients: (newRecipient: RecipientData[]) => void
  upsertRecipient: (newRecipient: RecipientData) => void
  removeRecipient: (index: number) => void
  mintAddress: string
  setMintAddress: (mintAddress: string) => void
  configs: Configs
  upsertConfigs: (data: Partial<Configs>) => void
  destroy: () => void
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
      recipients: [],
      setRecipients: (newRecipients: RecipientData[]) =>
        set({ recipients: newRecipients }, false, 'setRecipients'),
      upsertRecipient: (newRecipient: RecipientData) =>
        set(
          produce<MerkleStore>(({ recipients }) => {
            recipients.push(newRecipient)
          }),
          false,
          'upsertRecipient',
        ),
      removeRecipient: (index: number) =>
        set(
          produce<MerkleStore>(({ recipients }) => {
            recipients.splice(index, 1)
          }),
          false,
          'removeRecipient',
        ),
      mintAddress: '',
      setMintAddress: (mintAddress) =>
        set({ mintAddress }, false, 'setMintAddress'),
      configs: defaultConfigs,
      upsertConfigs: (data: Partial<Configs>) =>
        set(
          produce<MerkleStore>(({ configs }) => {
            Object.assign(configs, data)
          }),
        ),
      destroy: () =>
        set(
          {
            recipients: [],
            configs: defaultConfigs,
            mintAddress: '',
          },
          false,
          'destroy',
        ),
    }),
    {
      name: 'merkle',
      enabled: env === 'development',
    },
  ),
)

export default function MerkleProvider({ children }: { children: ReactNode }) {
  const utility = useUtility()
  const { publicKey } = useWallet()
  const upsertReceipt = useMerkleStore(({ upsertReceipt }) => upsertReceipt)
  const upsertDistributor = useMerkleStore(
    ({ upsertDistributor }) => upsertDistributor,
  )

  const fetchDistributors = useCallback(async () => {
    if (!utility) return
    const { account } = utility.program
    const distributors = await account.distributor.all()
    for (const { publicKey, account: distributorData } of distributors) {
      const address = publicKey.toBase58()
      upsertDistributor(address, distributorData)
    }
  }, [upsertDistributor, utility])

  useEffect(() => {
    fetchDistributors()
  }, [fetchDistributors])

  const fetchReceipts = useCallback(async () => {
    if (!publicKey || !utility) return
    const { account } = utility.program
    const receipts = await account.receipt.all([
      { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
    ])
    for (const { publicKey, account: receiptData } of receipts) {
      const address = publicKey.toBase58()
      upsertReceipt(address, receiptData)
    }
  }, [publicKey, upsertReceipt, utility])

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
 * Get all my distributes
 * @returns Distributes list
 */
export const useMyDistributes = () => {
  const distributors = useMerkleStore(({ distributors }) => distributors)
  const { publicKey } = useWallet()
  const getMetadata = useMerkleMetadata()
  const parseMerkleType = useParseMerkleType()

  const { value } = useAsync(async () => {
    const airdrops: string[] = []
    const vesting: string[] = []
    if (!publicKey) return { airdrops, vesting }

    for (const address in distributors) {
      const { authority } = distributors[address]
      if (!authority.equals(publicKey)) continue

      const metadata = await getMetadata(address)
      const root = MerkleDistributor.fromBuffer(Buffer.from(metadata.data))
      const merkleType = parseMerkleType(root)
      if (!merkleType) continue

      if (merkleType === Distribute.Airdrop) airdrops.push(address)
      if (merkleType === Distribute.Vesting) vesting.push(address)
    }

    return { airdrops, vesting }
  }, [publicKey, distributors])

  return { airdrops: value?.airdrops || [], vesting: value?.vesting || [] }
}

/**
 * Get my reward received list
 * @returns Reward received list
 */
export const useMyReceivedList = () => {
  const distributors = useDistributors()
  const getMetadata = useMerkleMetadata()
  const parseMerkleType = useParseMerkleType()
  const { publicKey } = useWallet()
  const utility = useUtility()

  const { value, error, loading } = useAsync(async () => {
    if (!publicKey || !utility) return {}
    const result: Record<string, Array<Leaf & { receiptAddress: string }>> = {}

    for (const address in distributors) {
      const metadata = await getMetadata(address)
      if (!metadata.data) continue
      const root = MerkleDistributor.fromBuffer(
        Buffer.from(metadata.data || metadata.data.data),
      )
      const merkleType = parseMerkleType(root)
      if (!merkleType) continue
      const recipients = await Promise.all(
        root.receipients
          .filter(({ authority }) => authority.equals(publicKey))
          .map(async (recipient) => {
            const receiptAddress = await utility.deriveReceiptAddress(
              recipient.salt,
              address,
            )
            return { ...recipient, receiptAddress }
          }),
      )

      if (recipients.length) result[address] = recipients
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

/**
 * Get all recipients
 * @returns Recipients list && upsert a recipient to list
 */
export const useRecipients = () => {
  const recipients = useMerkleStore(({ recipients }) => recipients)
  const setRecipients = useMerkleStore(({ setRecipients }) => setRecipients)
  const upsertRecipient = useMerkleStore(
    ({ upsertRecipient }) => upsertRecipient,
  )
  const removeRecipient = useMerkleStore(
    ({ removeRecipient }) => removeRecipient,
  )

  return { upsertRecipient, removeRecipient, setRecipients, recipients }
}

/**
 * Get/Set airdropped mint address
 * @returns Like-useState object
 */
export const useDistributeMintAddress = () => {
  const mintAddress = useMerkleStore(({ mintAddress }) => mintAddress)
  const setMintAddress = useMerkleStore(({ setMintAddress }) => setMintAddress)
  return { mintAddress, setMintAddress }
}

/**
 * Get/Set distribute configs
 * @returns Like-useState object
 */
export const useDistributeConfigs = () => {
  const configs = useMerkleStore(({ configs }) => configs)
  const upsertConfigs = useMerkleStore(({ upsertConfigs }) => upsertConfigs)
  return { configs, upsertConfigs }
}
