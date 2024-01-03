import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { DEFAULT_SEN_UTILITY_PROGRAM_ID } from '@sentre/utility'

import { Env, env } from './env'

/**
 * Contructor
 */
type Conf = {
  statRpc: string
  bundlStorage: string
  ankr: string
  network: WalletAdapterNetwork
  senswapAddress: string
  senFarmingProgram: string
  utilityProgram: string
  taxman: string
  fee: number
  operatorAddresses: string[]
}

const conf: Record<Env, Conf> = {
  /**
   * Development configurations
   */
  development: {
    // rpc: 'https://api.devnet.solana.com',
    // network: WalletAdapterNetwork.Devnet,
    // senswapAddress: '6SRa2Kc3G4wTG319G4Se6yrRWeS1A1Hj79BC3o7X9v6T',
    // senFarmingProgram: '6LaxnmWdYUAJvBJ4a1R8rrsvCRtaY7b43zKiNAU2k3Nx',
    // utilityProgram: 'AKTU61s8NJ8zJATQiceREdhXbedRnKrd1BVgnCuxmD2F',
    // bundlStorage: 'https://devnet.bundlr.network',
    ankr: '6fd209c7de745965c5b2092cb14245501fb6d4bd12a11db785dda62ab94cb2a4',
    network: WalletAdapterNetwork.Mainnet,
    senswapAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    senFarmingProgram: 'E6Vc9wipgm8fMXHEYwgN7gYdDbyvpPBUiTNy67zPKuF4',
    utilityProgram: DEFAULT_SEN_UTILITY_PROGRAM_ID,
    taxman: '9doo2HZQEmh2NgfT3Yx12M89aoBheycYqH1eaR5gKb3e',
    fee: 10 ** 6, // lamports
    statRpc: 'https://stat.sentre.io/',
    bundlStorage: 'https://node1.bundlr.network',
    operatorAddresses: ['8W6QginLcAydYyMYjxuyKQN56NzeakDE3aRFrAmocS6D'],
  },

  /**
   * Production configurations
   */
  production: {
    ankr: '6fd209c7de745965c5b2092cb14245501fb6d4bd12a11db785dda62ab94cb2a4',
    network: WalletAdapterNetwork.Mainnet,
    senswapAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    senFarmingProgram: 'E6Vc9wipgm8fMXHEYwgN7gYdDbyvpPBUiTNy67zPKuF4',
    utilityProgram: DEFAULT_SEN_UTILITY_PROGRAM_ID,
    taxman: '9doo2HZQEmh2NgfT3Yx12M89aoBheycYqH1eaR5gKb3e',
    fee: 10 ** 6, // lamports
    statRpc: 'https://stat.sentre.io/',
    bundlStorage: 'https://node1.bundlr.network',
    operatorAddresses: ['8W6QginLcAydYyMYjxuyKQN56NzeakDE3aRFrAmocS6D'],
  },
}

/**
 * Module exports
 */
export default conf[env]
