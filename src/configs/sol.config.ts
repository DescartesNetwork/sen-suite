import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

import { Env, env } from './env'

/**
 * Contructor
 */
type Conf = {
  rpc: string
  network: WalletAdapterNetwork
  balancerAddress: string
  senFarmingProgram: string
  taxman: string
  fee: number
}

const conf: Record<Env, Conf> = {
  /**
   * Development configurations
   */
  development: {
    rpc: 'https://api.devnet.solana.com',
    network: WalletAdapterNetwork.Devnet,
    balancerAddress: '6SRa2Kc3G4wTG319G4Se6yrRWeS1A1Hj79BC3o7X9v6T',
    senFarmingProgram: '6LaxnmWdYUAJvBJ4a1R8rrsvCRtaY7b43zKiNAU2k3Nx',
    // rpc: 'https://radial-billowing-gas.solana-mainnet.quiknode.pro/9d19e80c758eb5bd7b86d912e9345aa153db6a8f/',
    // network: WalletAdapterNetwork.Mainnet,
    // balancerAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    // senFarmingProgram: 'E6Vc9wipgm8fMXHEYwgN7gYdDbyvpPBUiTNy67zPKuF4',
    taxman: '9doo2HZQEmh2NgfT3Yx12M89aoBheycYqH1eaR5gKb3e',
    fee: 10 ** 6, //lamports
  },

  /**
   * Production configurations
   */
  production: {
    rpc: 'https://solitary-autumn-water.solana-mainnet.quiknode.pro/05b03a0cfeb8a5ec38f4c55950eb9b9bad7c8b58/',
    network: WalletAdapterNetwork.Mainnet,
    balancerAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    senFarmingProgram: 'E6Vc9wipgm8fMXHEYwgN7gYdDbyvpPBUiTNy67zPKuF4',
    taxman: '9doo2HZQEmh2NgfT3Yx12M89aoBheycYqH1eaR5gKb3e',
    fee: 10 ** 6, //lamports
  },
}

/**
 * Module exports
 */
export default conf[env]
