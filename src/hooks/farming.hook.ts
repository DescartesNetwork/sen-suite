import { useMemo } from 'react'
import SenFarmingProgram from '@sentre/farming'

import { useAnchorProvider } from '@/hooks/spl.hook'
import solConfig from '@/configs/sol.config'

export const useFarming = () => {
  const provider = useAnchorProvider()
  const farming = useMemo(
    () => new SenFarmingProgram(provider, solConfig.senFarmingProgram),
    [provider],
  )
  return farming
}
