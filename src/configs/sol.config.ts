import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

import { Env } from './env'

/**
 * Contructor
 */
type Conf = {
  rpc: string
  network: WalletAdapterNetwork
  balancerAddress: string
}

const conf: Record<Env, Conf> = {
  /**
   * Development configurations
   */
  development: {
    rpc: 'https://api.devnet.solana.com',
    network: WalletAdapterNetwork.Devnet,
    balancerAddress: '6SRa2Kc3G4wTG319G4Se6yrRWeS1A1Hj79BC3o7X9v6T',
  },

  /**
   * Staging configurations
   */
  test: {
    rpc: 'https://api.testnet.solana.com',
    network: WalletAdapterNetwork.Testnet,
    balancerAddress: '',
  },

  /**
   * Production configurations
   */
  production: {
    rpc: 'https://api.mainnet-beta.solana.com',
    network: WalletAdapterNetwork.Mainnet,
    balancerAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
  },
}

/**
 * Module exports
 */
export default conf
