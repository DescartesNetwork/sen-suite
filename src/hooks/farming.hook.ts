import { useCallback, useMemo } from 'react'
import SenFarmingProgram from '@sentre/farming'
import BN from 'bn.js'

import { useAnchorProvider } from '@/hooks/spl.hook'
import solConfig from '@/configs/sol.config'
import { useAllFarms, useFarmByAddress } from '@/providers/farming.provider'

/**
 * Velocity precision
 */
export const precision = new BN(10 ** 9)

/**
 * Instantiate a farming
 * @returns Farming instance
 */
export const useFarming = () => {
  const provider = useAnchorProvider()
  const farming = useMemo(
    () => new SenFarmingProgram(provider, solConfig.senFarmingProgram),
    [provider],
  )
  return farming
}

/**
 * Parse farm statistic data to compue APR, TVL, etc.
 * @param farmAddress Farm address
 * @returns Statistic data
 */
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

/**
 * Sort farm in the time order
 * @param farmAddresses Farm addresses
 * @returns Sorted farm addresses
 */
export const useSortedFarmsByStartDate = (farmAddresses: string[]) => {
  const farms = useAllFarms()

  const sortedFarmAddresses = useMemo(
    () =>
      farmAddresses.sort((a, b) => {
        const { startDate: ad } = farms[a]
        const { startDate: bd } = farms[b]
        if (ad.eq(bd)) return 0
        else if (ad.lt(bd)) return 1
        else return -1
      }),
    [farms, farmAddresses],
  )

  return sortedFarmAddresses
}
