import BN from 'bn.js'

import { Env, env } from './env'

/**
 * Contructor
 */
type Conf = {
  senswapAddress: string
  sntrAddress: string
  usdcAddress: string
  usdtAddress: string
  taxmanAddress: string
  fee: BN
  tax: BN
}

const conf: Record<Env, Conf> = {
  /**
   * Development configurations
   */
  development: {
    senswapAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    sntrAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
    usdcAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    usdtAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    taxmanAddress: '9doo2HZQEmh2NgfT3Yx12M89aoBheycYqH1eaR5gKb3e',
    fee: new BN(2_500_000), // 0.25%
    tax: new BN(500_000), // 0.05%
  },

  /**
   * Production configurations
   */
  production: {
    senswapAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    sntrAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
    usdcAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    usdtAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    taxmanAddress: '9doo2HZQEmh2NgfT3Yx12M89aoBheycYqH1eaR5gKb3e',
    fee: new BN(2_500_000), // 0.25%
    tax: new BN(500_000), // 0.05%
  },
}

/**
 * Module exports
 */
export default conf[env]
