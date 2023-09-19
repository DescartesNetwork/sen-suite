import { useCallback, useEffect, useMemo, useState } from 'react'
import { encode } from 'bs58'
import { utilsBN } from '@sen-use/web3'
import Launchpad from '@sentre/launchpad'
import axios from 'axios'
import useSWR from 'swr'
import BN from 'bn.js'

import { useAnchorProvider } from '@/providers/wallet.provider'
import {
  useCheques,
  useLaunchpadByAddress,
  useLaunchpads,
} from '@/providers/launchpad.provider'
import { LaunchpadMetadata, toFilename } from '@/helpers/aws'
import solConfig from '@/configs/sol.config'
import { usePrices } from '@/providers/mint.provider'
import { usePoolByAddress } from '@/providers/pools.provider'
import { decimalize } from '@/helpers/decimals'
import { useWallet } from '@solana/wallet-adapter-react'

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
  yourPurchase = 'Your purchased',
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
 * Get token price in launchpad
 * @param launchpadAddr launchpad address
 * @returns  token price
 */
export const useTokenPrice = (launchpadAddr: string) => {
  const { stableMint, pool, endTime } = useLaunchpadByAddress(launchpadAddr)
  const { reserves } = usePoolByAddress(pool.toBase58())
  const [stbPrice] = usePrices([stableMint.toBase58()]) || [1]
  const getLaunchpadWeights = useGetLaunchpadWeight()
  const getBalanceAtTime = useGetBalanceAtTime(launchpadAddr)
  const calcPrice = useCalcPrice()
  const weights = useLaunchpadWeight(launchpadAddr)
  const tokePrice = useMemo(() => {
    let balances = reserves
    let currentWeights = weights
    if (balances[0].isZero() || balances[1].isZero()) {
      currentWeights = getLaunchpadWeights(
        endTime.toNumber() * 1000,
        launchpadAddr,
      )
      balances = getBalanceAtTime(endTime.toNumber() * 1000)
    }
    const price = calcPrice(
      decimalize(currentWeights[0].toString(), 9),
      balances[0],
      stbPrice,
      balances[1],
      decimalize(currentWeights[1].toString(), 9),
    )
    return price
  }, [
    calcPrice,
    endTime,
    getBalanceAtTime,
    getLaunchpadWeights,
    launchpadAddr,
    reserves,
    stbPrice,
    weights,
  ])

  return tokePrice
}

/**
 * Filter launchpads by LaunchpadSate
 * @param state LaunchpadSate (Get all launchpad if sate === undefined)
 * @returns  list launchpad addresses filtered
 */
export const useFilterLaunchpad = (state?: LaunchpadSate) => {
  const launchpads = useLaunchpads()
  const { publicKey } = useWallet()

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
      const authority = launchpadData.authority
      const now = Date.now()

      switch (state) {
        case LaunchpadSate.active:
          if (startTime > now || endTime < now) valid = false
          break
        case LaunchpadSate.upcoming:
          if (startTime < now || endTime < now) valid = false
          break
        case LaunchpadSate.completed:
          if (endTime >= now) valid = false
          break
        case LaunchpadSate.yourPurchase:
          if (!publicKey || !publicKey.equals(authority)) valid = false
          break
      }
      if (valid) result.push(address)
    }

    return result
  }, [launchpads, publicKey, state])

  return filteredLaunchpads
}

/**
 * Get balance of launchpad at the time
 * @param launchpadAddr launchpad address
 * @returns  get balance function
 */
export const useGetBalanceAtTime = (launchpadAddr: string) => {
  const { startReserves } = useLaunchpadByAddress(launchpadAddr)
  const cheques = useCheques()

  const getBalanceAtTime = useCallback(
    (time: number) => {
      let totalSoldBid = new BN(0)
      let totalSoldAsk = new BN(0)

      for (const address in cheques) {
        const { createAt, askAmount, bidAmount, launchpad } = cheques[address]
        if (launchpad.toBase58() !== launchpadAddr) continue
        if (createAt.toNumber() * 1000 > time) continue
        totalSoldAsk = totalSoldAsk.add(askAmount)
        totalSoldBid = totalSoldAsk.add(bidAmount)
      }
      utilsBN
      return [
        startReserves[0].sub(totalSoldAsk),
        startReserves[1].add(totalSoldBid),
      ]
    },
    [cheques, launchpadAddr, startReserves],
  )
  return getBalanceAtTime
}

/**
 * Get launchpad weights
 * @returns Get launchpad weights function
 */
export const useGetLaunchpadWeight = () => {
  const launchpads = useLaunchpads()

  const calc_new_weight = (
    start_weight: number,
    end_weight: number,
    ratio_with_precision: number,
  ) => {
    const amount =
      start_weight > end_weight
        ? start_weight - end_weight
        : end_weight - start_weight

    const diff = amount * ratio_with_precision
    const new_weight =
      start_weight > end_weight ? start_weight - diff : start_weight + diff
    return new_weight
  }

  const getLaunchpadWeights = useCallback(
    (
      currentTime: number,
      launchpadAddr = '',
      startWeights = [0, 0],
      endWeights = [0, 0],
      startTime = 0,
      endTime = 0,
    ) => {
      const MINT_IDX = 0
      const BASE_MINT_IDX = 1
      const launchpadData = launchpads[launchpadAddr]
      const start_time = launchpadAddr
        ? launchpadData.startTime.toNumber()
        : startTime
      const end_time = launchpadAddr
        ? launchpadData.endTime.toNumber()
        : endTime

      const start_weight_mint = launchpadAddr
        ? launchpadData.startWeights[MINT_IDX].toNumber()
        : startWeights[MINT_IDX]

      const start_weight_base_mint = launchpadAddr
        ? launchpadData.startWeights[BASE_MINT_IDX].toNumber()
        : startWeights[BASE_MINT_IDX]

      const end_weight_mint = launchpadAddr
        ? launchpadData.endWeights[MINT_IDX].toNumber()
        : endWeights[MINT_IDX]

      const end_weight_base_mint = launchpadAddr
        ? launchpadData.endWeights[BASE_MINT_IDX].toNumber()
        : endWeights[BASE_MINT_IDX]

      const ratio = (currentTime / 1000 - start_time) / (end_time - start_time)
      return [
        calc_new_weight(start_weight_mint, end_weight_mint, ratio),
        calc_new_weight(start_weight_base_mint, end_weight_base_mint, ratio),
      ]
    },
    [launchpads],
  )

  return getLaunchpadWeights
}

/**
 * Get current launchpad weights
 * @returns current launchpad weights
 */
export const useLaunchpadWeight = (launchpadAddress: string) => {
  const [currentTime, setCurrentTime] = useState(new Date().getTime())
  const getLaunchpadWeights = useGetLaunchpadWeight()
  const timeout = 5000

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getTime())
    }, timeout)
    return () => clearInterval(interval)
  }, [timeout])

  const currentWeights = useMemo(() => {
    const weights = getLaunchpadWeights(currentTime, launchpadAddress)
    return weights
  }, [currentTime, getLaunchpadWeights, launchpadAddress])

  return currentWeights
}

/**
 * Calculate price in Pool
 * @returns  Calc function
 */
export const useCalcPrice = () => {
  const calcPrice = useCallback(
    (weightA: BN, balanceA: BN, priceB: number, balanceB: BN, weightB: BN) => {
      const totalWeights = utilsBN.toNumber(weightA) + utilsBN.toNumber(weightB)
      const numWeightA = utilsBN.toNumber(weightA) / totalWeights
      const numWeightB = utilsBN.toNumber(weightB) / totalWeights
      const numBalanceA = utilsBN.toNumber(balanceA)
      const numBalanceB = utilsBN.toNumber(balanceB)
      const priceA =
        (numWeightA * numBalanceB * priceB) / (numBalanceA * numWeightB)
      return priceA
    },
    [],
  )
  return calcPrice
}
