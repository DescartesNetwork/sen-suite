import { useCallback, useMemo } from 'react'
import { encode } from 'bs58'
import Launchpad from '@sentre/launchpad'
import axios from 'axios'
import useSWR from 'swr'

import { useAnchorProvider } from '@/providers/wallet.provider'
import {
  useLaunchpadByAddress,
  useLaunchpads,
} from '@/providers/launchpad.provider'
import { LaunchpadMetadata, toFilename } from '@/helpers/aws'
import solConfig from '@/configs/sol.config'

export type ProjectInfo = {
  projectName: string
  description: string
  website: string
  github: string
  whitepaper: string
  vCs: { logo: string; link: string }[]
  socials: string[]
  coverPhoto: string
  category: string[]
  baseAmount: number
}

export enum LaunchpadSate {
  active = 'active',
  upcoming = 'upcoming',
  completed = 'completed',
}

/**
 * Instantiate a balancer
 * @returns Balancer instance
 */
export const useLaunchpadProgram = () => {
  const provider = useAnchorProvider()
  const { launchpadAddress, balancerAddress } = solConfig
  const launchpad = useMemo(
    () => new Launchpad(provider, launchpadAddress, balancerAddress),
    [balancerAddress, launchpadAddress, provider],
  )
  return launchpad
}

/**
 * Get launchpad metadata by launchpad address
 * @returns  LaunchpadData
 */
export const useLaunchpadMetadata = (launchpadAddress: string) => {
  const { metadata } = useLaunchpadByAddress(launchpadAddress)

  const getMetadata = useCallback(
    async ([launchpadAddress]: [string]) => {
      try {
        let cid = encode(Buffer.from(metadata))
        if (LaunchpadMetadata[launchpadAddress])
          cid = LaunchpadMetadata[launchpadAddress]

        const fileName = toFilename(cid)
        const url = 'https://sen-storage.s3.us-west-2.amazonaws.com/' + fileName
        const { data } = await axios.get(url)
        return data as ProjectInfo
      } catch (error) {
        return undefined
      }
    },
    [metadata],
  )

  const { data: projectInfo } = useSWR(
    [launchpadAddress, 'launchpadMetadata'],
    getMetadata,
  )

  return projectInfo
}

/**
 * Filter launchpads by LaunchpadSate
 * @param state LaunchpadSate (Get all launchpad if sate === undefined)
 * @returns  list launchpad addresses filtered
 */
export const useFilterLaunchpad = (state?: LaunchpadSate) => {
  const launchpads = useLaunchpads()

  const filteredLaunchpads = useMemo(() => {
    const result = []

    const validLaunchpads = Object.keys(launchpads).filter(
      (address) => !launchpads[address].state['uninitialized'],
    )

    validLaunchpads.sort((a, b) => {
      const a_startTime = launchpads[a].startTime.toNumber()
      const b_startTime = launchpads[b].startTime.toNumber()

      return b_startTime - a_startTime
    })

    if (!state) return validLaunchpads

    for (const address of validLaunchpads) {
      const launchpadData = launchpads[address]
      let valid = true
      const startTime = launchpadData.startTime.toNumber() * 1000
      const endTime = launchpadData.endTime.toNumber() * 1000
      const now = Date.now()

      switch (state) {
        case LaunchpadSate.completed:
          if (startTime > now || endTime < now) valid = false
          break
        case LaunchpadSate.upcoming:
          if (startTime < now || endTime < now) valid = false
          break
        case LaunchpadSate.active:
          if (endTime >= now) valid = false
          break
      }
      if (valid) result.push(address)
    }

    return result
  }, [launchpads, state])

  return filteredLaunchpads
}
