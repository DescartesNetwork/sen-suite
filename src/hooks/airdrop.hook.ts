import { useCallback, useMemo } from 'react'
import { Utility, Leaf, MerkleDistributor } from '@sentre/utility'
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { decode, encode } from 'bs58'
import BN from 'bn.js'
import axios from 'axios'

import solConfig from '@/configs/sol.config'
import { decimalize } from '@/helpers/decimals'
import { useMints } from './spl.hook'
import { isAddress } from '@/helpers/utils'
import {
  useDistributeConfigs,
  useDistributeMintAddress,
  useDistributors,
  useMyReceipts,
  useRecipients,
} from '@/providers/merkle.provider'
import { MetadataBackup, toFilename, uploadFileToAws } from '@/helpers/aws'
import { useMintByAddress } from '@/providers/mint.provider'
import { ReceiptState } from '@/app/airdrop/merkle-distribution/rewardCard'

/**
 * Instantiate a utility
 * @returns Utility instance
 */
export const useUtility = () => {
  const wallet = useAnchorWallet()
  const utility = useMemo(
    () => (wallet ? new Utility(wallet, solConfig.rpc) : undefined),
    [wallet],
  )
  return utility
}

/**
 * Get utility's bulk sender function
 * @param mintAddress Mint address
 * @returns Bulk sender function
 */
export const useSendBulk = (mintAddress: string) => {
  const utility = useUtility()
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [mint] = useMints([mintAddress])

  const decimals = useMemo(() => mint?.decimals, [mint?.decimals])

  const sendBulk = useCallback(
    async (data: string[][]) => {
      if (!utility || !publicKey || !sendTransaction)
        throw new Error('Wallet is not connected yet.')
      if (!isAddress(mintAddress)) throw new Error('Invalid mint address.')
      if (decimals === undefined) throw new Error('Cannot read onchain data.')
      // Instructions
      const ixs = await Promise.all(
        data
          .map(([address, amount]): [string, BN] => [
            address,
            decimalize(amount, decimals),
          ])
          .map(async ([address, amount]) => {
            const { tx } = await utility.safeTransfer({
              amount,
              tokenAddress: mintAddress,
              dstWalletAddress: address,
              sendAndConfirm: false,
              feeOptions: {
                fee: new BN(solConfig.fee),
                feeCollectorAddress: solConfig.taxman,
              },
            })
            return tx
          }),
      )
      // Transaction
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext()
      const tx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: publicKey,
      }).add(...ixs)
      const signature = await sendTransaction(tx, connection, {
        minContextSlot,
      })
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      })
      return signature
    },
    [decimals, utility, mintAddress, publicKey, sendTransaction, connection],
  )

  return sendBulk
}

export enum Distribute {
  Vesting = 'vesting',
  Airdrop = 'airdrop',
}

/**
 * Get type's merkle distributor
 * @param merkle MerkleDistributor
 * @returns Vesting or Airdrop type
 */
export const useParseMerkleType = () => {
  const parseMerkleType = useCallback((merkle: MerkleDistributor) => {
    try {
      const types = [Distribute.Airdrop, Distribute.Vesting]
      for (const type of types) {
        const airdropSalt_v1 = MerkleDistributor.salt('0')
        const airdropSalt_v2 = MerkleDistributor.salt(
          `lightning_tunnel/${type}/0`,
        )
        const salt = merkle.receipients[0].salt
        const x1 = Buffer.compare(airdropSalt_v1, salt)
        const x2 = Buffer.compare(airdropSalt_v2, salt)

        if (x1 !== 0 && x2 !== 0) continue
        return type
      }
      return null
    } catch (error) {
      return null
    }
  }, [])

  return parseMerkleType
}

/**
 * Get merkle distributor bytes by metadata
 * @param distributor distributor address
 
 * @returns  merkle distributor bytes and createdAt
 */
export const useMerkleMetadata = () => {
  const distributors = useDistributors()
  const getMetadata = useCallback(
    async (distributor: string) => {
      try {
        const { metadata } = distributors[distributor]
        let cid = encode(Buffer.from(metadata))
        if (MetadataBackup[distributor]) cid = MetadataBackup[distributor]

        const fileName = toFilename(cid)
        const url = 'https://sen-storage.s3.us-west-2.amazonaws.com/' + fileName
        const { data } = await axios.get(url)
        return data
      } catch (error) {
        return { data: '', createdAt: 0 }
      }
    },
    [distributors],
  )

  return getMetadata
}

/**
 * Get receipt status
 * @param distributor distributor address
 * @param receiptAddress receipt address
 * @param startedAt Time to claim reward
 * @returns  receipt status
 */
export const useReceiptStatus = () => {
  const distributors = useDistributors()
  const myReceipts = useMyReceipts()

  const getReceiptStatus = useCallback(
    (distributor: string, receiptAddress: string, startedAt: BN) => {
      const { endedAt } = distributors[distributor]
      const receiptData = myReceipts[receiptAddress]
      const { claimed, expired, ready, waiting } = ReceiptState

      if (receiptData) return claimed
      if (Date.now() && endedAt.toNumber() > Date.now()) return expired

      const starttime = startedAt.toNumber()
      if (starttime * 1000 > Date.now() && startedAt) return waiting

      return ready
    },
    [distributors, myReceipts],
  )

  return getReceiptStatus
}

/**
 * Get total value distribute and quantity of recipients
 * @returns quantity of recipients & total distribute
 */
export const useTotalDistribute = () => {
  const { recipients } = useRecipients()
  const { mintAddress } = useDistributeMintAddress()

  const { decimals } = useMintByAddress(mintAddress) || { decimals: 0 }

  const total = useMemo(
    () =>
      recipients.reduce(
        (pre, curr) => pre.add(decimalize(curr.amount, decimals)),
        new BN(0),
      ),
    [decimals, recipients],
  )

  return { total, quantity: recipients.length }
}

export const useClaim = (distributor: string, recipientData: Leaf) => {
  const getMetadata = useMerkleMetadata()
  const utility = useUtility()

  const onClaim = useCallback(async () => {
    if (!utility) return ''
    const { data } = await getMetadata(distributor)
    const merkle = MerkleDistributor.fromBuffer(Buffer.from(data))
    const proof = merkle.deriveProof(recipientData)
    const validProof = merkle.verifyProof(proof, recipientData)
    if (!validProof) throw "You don't belong this merkle tree!"
    const { txId } = await utility.claim({
      distributorAddress: distributor,
      proof,
      data: recipientData,
      feeOptions: {
        fee: new BN(solConfig.fee),
        feeCollectorAddress: solConfig.taxman,
      },
    })
    return txId
  }, [distributor, getMetadata, recipientData, utility])

  return onClaim
}

export const useInitMerkleTree = () => {
  const { recipients } = useRecipients()
  const {
    configs: { expiration },
  } = useDistributeConfigs()
  const { mintAddress } = useDistributeMintAddress()
  const { decimals } = useMintByAddress(mintAddress) || { decimals: 0 }
  const utility = useUtility()

  const toUnitTime = useCallback((time: number) => {
    const unitDate = new Date(time).toUTCString()
    const unitTime = new Date(unitDate).getTime()
    return unitTime
  }, [])

  const onInitMerkleTree = useCallback(async () => {
    if (!utility) return

    // Build tree
    const leafs: Leaf[] = recipients.map(
      ({ address, unlockTime, amount }, i) => {
        const unitTime = toUnitTime(unlockTime)
        return {
          amount: decimalize(amount, decimals),
          authority: new PublicKey(address),
          startedAt: new BN(unitTime / 1000),
          salt: MerkleDistributor.salt(
            `lightning_tunnel/airdrop/${i.toString()}`,
          ),
        }
      },
    )
    const merkleDistributor = new MerkleDistributor(leafs)
    const data = {
      createAt: Math.floor(Date.now() / 1000),
      data: merkleDistributor.toBuffer(),
    }
    const blob = [
      new Blob([JSON.stringify({ ...data }, null, 2)], {
        type: 'application/json',
      }),
    ]

    const file = new File(blob, 'metadata.txt')
    const cid = await uploadFileToAws(file)
    const { txId } = await utility.initializeDistributor({
      tokenAddress: mintAddress,
      total: merkleDistributor.getTotal(),
      merkleRoot: merkleDistributor.deriveMerkleRoot(),
      metadata: decode(cid),
      endedAt: expiration / 1000,
      feeOptions: {
        fee: new BN(solConfig.fee),
        feeCollectorAddress: solConfig.taxman,
      },
    })
    return txId || ''
  }, [decimals, expiration, mintAddress, recipients, toUnitTime, utility])

  return onInitMerkleTree
}
