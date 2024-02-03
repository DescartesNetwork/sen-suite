import { Env, env } from './env'

const PIE_COLORS = [
  '#ff6961',
  '#ffb480',
  '#f8f38d',
  '#42d6a4',
  '#08cad1',
  '#59adf6',
  '#9d94ff',
  '#c780e8',
]

const BAR_COLOR = '#63E0B3'

/**
 * Contructor
 */
type Conf = {
  pie: { colors: string[] }
  bar: { color: string }
}

const conf: Record<Env, Conf> = {
  /**
   * Development configurations
   */
  development: {
    pie: { colors: PIE_COLORS },
    bar: { color: BAR_COLOR },
  },

  /**
   * Production configurations
   */
  production: {
    pie: { colors: PIE_COLORS },
    bar: { color: BAR_COLOR },
  },
}

/**
 * Module exports
 */
export default conf[env]
