import { Env, env } from './env'

/**
 * Contructor
 */
type Conf = {
  host: string
}

const conf: Record<Env, Conf> = {
  /**
   * Development configurations
   */
  development: {
    host: 'http://localhost:10000',
  },

  /**
   * Production configurations
   */
  production: {
    host: 'https://sage.sentre.io',
  },
}

/**
 * Module exports
 */
export default conf[env]
