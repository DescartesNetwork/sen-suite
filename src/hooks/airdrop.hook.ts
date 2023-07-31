import { useCallback, useMemo } from 'react'
import { Utility } from '@sentre/utility'
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react'
import BN from 'bn.js'
import { Transaction } from '@solana/web3.js'

import solConfig from '@/configs/sol.config'
import { decimalize } from '@/helpers/decimals'
import { useMints } from './spl.hook'
import { isAddress } from '@/helpers/utils'

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
      console.log('tx size:', tx.serialize({ verifySignatures: false }).length)
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
