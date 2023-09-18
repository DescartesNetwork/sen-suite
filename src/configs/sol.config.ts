import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { DEFAULT_SEN_UTILITY_PROGRAM_ID } from '@sentre/utility'

import { Env, env } from './env'

/**
 * Contructor
 */
type Conf = {
  statRpc: string
  bundlStorage: string
  rpc: string
  network: WalletAdapterNetwork
  balancerAddress: string
  senFarmingProgram: string
  launchpadAddress: string
  utilityProgram: string
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
    utilityProgram: 'AKTU61s8NJ8zJATQiceREdhXbedRnKrd1BVgnCuxmD2F',
    bundlStorage: 'https://devnet.bundlr.network',
    // rpc: 'https://radial-billowing-gas.solana-mainnet.quiknode.pro/9d19e80c758eb5bd7b86d912e9345aa153db6a8f/',
    // network: WalletAdapterNetwork.Mainnet,
    // balancerAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    // senFarmingProgram: 'E6Vc9wipgm8fMXHEYwgN7gYdDbyvpPBUiTNy67zPKuF4',
    // utilityProgram: DEFAULT_SEN_UTILITY_PROGRAM_ID,
    // bundlStorage: 'https://node1.bundlr.network',
    launchpadAddress: '54e31kYfV9KSfrXBCdxn2aAuL7hY5WhvDuqGaNhFYAJe',
    taxman: '9doo2HZQEmh2NgfT3Yx12M89aoBheycYqH1eaR5gKb3e',
    fee: 10 ** 6, // lamports
    statRpc: 'https://stat.sentre.io/',
  },

  /**
   * Production configurations
   */
  production: {
    rpc: 'https://solitary-autumn-water.solana-mainnet.quiknode.pro/05b03a0cfeb8a5ec38f4c55950eb9b9bad7c8b58/',
    network: WalletAdapterNetwork.Mainnet,
    balancerAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    senFarmingProgram: 'E6Vc9wipgm8fMXHEYwgN7gYdDbyvpPBUiTNy67zPKuF4',
    launchpadAddress: '54e31kYfV9KSfrXBCdxn2aAuL7hY5WhvDuqGaNhFYAJe',
    utilityProgram: DEFAULT_SEN_UTILITY_PROGRAM_ID,
    taxman: '9doo2HZQEmh2NgfT3Yx12M89aoBheycYqH1eaR5gKb3e',
    fee: 10 ** 6, // lamports
    statRpc: 'https://stat.sentre.io/',
    bundlStorage: 'https://node1.bundlr.network',
  },
}

/**
 * Module exports
 */
export default conf[env]
