import { useMemo, useState } from 'react'
import SenFarmingProgram from '@sentre/farming'
import BN from 'bn.js'
import { useInterval } from 'react-use'

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
 * Get farm's lifetime
 * @param farmAddress Farm address
 * @returns Lifetime
 */
export const useFarmLifetime = (farmAddress: string) => {
  const { startDate, endDate } = useFarmByAddress(farmAddress)
  const lifetime = useMemo(() => endDate.sub(startDate), [startDate, endDate])
  return lifetime
}

/**
 * (Intervally) Get farm's time passed
 * @param farmAddress Farm address
 * @returns Time passed
 */
export const useFarmTimePassed = (
  farmAddress: string,
  delay: number | null = null,
) => {
  const [currentDate, setCurrentDate] = useState(Math.round(Date.now() / 1000))
  const { startDate } = useFarmByAddress(farmAddress)
  const lifetime = useFarmLifetime(farmAddress)

  useInterval(() => setCurrentDate(Math.round(Date.now() / 1000)), delay)

  const timePassed = useMemo(
    () =>
      BN.min(BN.max(new BN(currentDate).sub(startDate), new BN(0)), lifetime),
    [startDate, lifetime, currentDate],
  )

  return timePassed
}

/**
 * Get farm's velocity
 * @param farmAddress Farm address
 * @returns Velocity (out_tokens/seconds) with precision
 */
export const useFarmVelocity = (farmAddress: string) => {
  const { totalRewards } = useFarmByAddress(farmAddress)
  const lifetime = useFarmLifetime(farmAddress)
  const velocity = useMemo(
    () => totalRewards.mul(precision).div(lifetime),
    [totalRewards, lifetime],
  )
  return velocity
}

/**
 * Get farm's emission rate
 * @param farmAddress Farm address
 * @returns Emission rate (out_tokens/seconds/in_tokens) with precision
 */
export const useFarmEmissionRate = (farmAddress: string) => {
  const { totalShares } = useFarmByAddress(farmAddress)
  const velocity = useFarmVelocity(farmAddress)
  const emissionRate = useMemo(
    () => (totalShares.isZero() ? velocity : velocity.div(totalShares)),
    [totalShares, velocity],
  )
  return emissionRate
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
