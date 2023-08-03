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
    host: 'http://localhost:3000',
  },

  /**
   * Production configurations
   */
  production: {
    host: 'https://dev.sentre.io',
  },
}

/**
 * Module exports
 */
export default conf[env]
