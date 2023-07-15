import { env } from './env'
import sol from './sol.config'

const configs = {
  env,
  sol: sol[env],
}

export default configs
