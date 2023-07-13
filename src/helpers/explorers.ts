import { isAddress } from './utils'

export type Cluster = 'devnet' | 'testnet' | 'mainnet-beta'

/**
 * Build an explorer url by the context including addresses or transaction ids
 * @param addressOrTxId - Address or TxId
 * @param cluster - Network
 * @returns
 */
export const solscan = (
  addressOrTxId: string,
  cluster: Cluster = 'mainnet-beta',
): string => {
  if (!addressOrTxId) return ''
  if (isAddress(addressOrTxId)) {
    return `https://solscan.io/account/${addressOrTxId}?cluster=${cluster}`
  }
  return `https://solscan.io/tx/${addressOrTxId}?cluster=${cluster}`
}
