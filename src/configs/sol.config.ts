import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

import { Env, env } from './env'

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
    // rpc: 'https://radial-billowing-gas.solana-mainnet.quiknode.pro/9d19e80c758eb5bd7b86d912e9345aa153db6a8f/',
    // network: WalletAdapterNetwork.Mainnet,
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
    rpc: 'https://solitary-autumn-water.solana-mainnet.quiknode.pro/05b03a0cfeb8a5ec38f4c55950eb9b9bad7c8b58/',
    network: WalletAdapterNetwork.Mainnet,
    balancerAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
  },
}

/**
 * Module exports
 */
export default conf[env]
