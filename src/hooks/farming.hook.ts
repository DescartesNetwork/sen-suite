import { useCallback, useMemo } from 'react'
import SenFarmingProgram from '@sentre/farming'
import BN from 'bn.js'

import { useAnchorProvider } from '@/hooks/spl.hook'
import solConfig from '@/configs/sol.config'
import { useFarmByAddress } from '@/providers/farming.provider'

export const precision = new BN(10 ** 9)

export const useFarming = () => {
  const provider = useAnchorProvider()
  const farming = useMemo(
    () => new SenFarmingProgram(provider, solConfig.senFarmingProgram),
    [provider],
  )
  return farming
}

export const useFarmOracle = (farmAddress: string) => {
  const { startDate, endDate, totalShares, totalRewards, compensation } =
    useFarmByAddress(farmAddress)

  const lifetime = useMemo(() => endDate.sub(startDate), [startDate, endDate])
  const timePassed = useMemo(
    () =>
      BN.min(
        BN.max(new BN(Math.round(Date.now() / 1000)).sub(startDate), new BN(0)),
        lifetime,
      ),
    [startDate, lifetime],
  )
  const velocity = useMemo(
    () => totalRewards.mul(precision).div(lifetime),
    [totalRewards, lifetime],
  )
  const emissionRate = useMemo(
    () => (totalShares.isZero() ? velocity : velocity.div(totalShares)),
    [totalShares, velocity],
  )
  const maxCompensation = useMemo(
    () => timePassed.mul(velocity),
    [timePassed, velocity],
  )
  const getNextCompensation = useCallback(
    (nextEmissionRate: BN) =>
      emissionRate.sub(nextEmissionRate).mul(timePassed).add(compensation),
    [emissionRate, timePassed, compensation],
  )

  return {
    precision,
    lifetime,
    timePassed,
    velocity,
    emissionRate,
    maxCompensation,
    getNextCompensation,
  }
}
