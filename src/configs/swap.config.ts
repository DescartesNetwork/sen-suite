import { Env, env } from './env'

/**
 * Contructor
 */
type Conf = {
  senswapAddress: string
  sntrAddress: string
  usdcAddress: string
}

const conf: Record<Env, Conf> = {
  /**
   * Development configurations
   */
  development: {
    senswapAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    sntrAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
    usdcAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },

  /**
   * Production configurations
   */
  production: {
    senswapAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    sntrAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
    usdcAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
}

/**
 * Module exports
 */
export default conf[env]
