import { useCallback, useEffect, useMemo, useState } from 'react'
import Balancer, { PoolData } from '@senswap/balancer'
import { useWallet } from '@solana/wallet-adapter-react'
import { utils } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import dayjs from 'dayjs'

import { useAnchorProvider } from '@/providers/wallet.provider'
import { undecimalize } from '@/helpers/decimals'
import { useSearchMint } from '@/providers/mint.provider'
import { usePools, useStatByPoolAddress } from '@/providers/pools.provider'
import { useAllTokenAccounts } from '@/providers/tokenAccount.provider'
import solConfig from '@/configs/sol.config'

export const GENERAL_NORMALIZED_NUMBER = 10 ** 9
export const LPT_DECIMALS = 9
export const GENERAL_DECIMALS = 9
export const PRECISION = 1_000_000_000

export enum FilterPools {
  AllPools = 'all-pools',
  DepositedPools = 'deposited-pools',
  YourPools = 'your-pools',
}
export type VolumeData = { data: number; label: string }

export const useBalancer = () => {
  const provider = useAnchorProvider()
  const balancer = useMemo(
    () => new Balancer(provider, solConfig.balancerAddress),
    [provider],
  )
  return balancer
}

export const useSearchPool = (
  pools: Record<string, PoolData>,
  text: string,
) => {
  const search = useSearchMint()

  const poolSearched = useMemo((): Record<string, PoolData> => {
    const newPoolsSearch: Record<string, PoolData> = {}
    if (!text.length || text.length <= 2) return pools

    const mintAddresses = search(text).map(({ item }) => item.address)
    const filteredPool = Object.keys(pools)
      .filter((poolAddress) => {
        const poolData = pools[poolAddress]
        const { mintLpt, mints } = poolData
        // Search poolAddress
        if (poolAddress.includes(text)) return true
        // Search minLpt
        if (mintLpt.toBase58().includes(text)) return true
        // Search Token
        for (const mint in mints) {
          if (mintAddresses.includes(mints[mint].toBase58())) return true
          if (text.includes(mints[mint].toBase58())) return true
        }
        return false
      })
      .sort()
    filteredPool.forEach(
      (address) => (newPoolsSearch[address] = pools[address]),
    )

    return newPoolsSearch
  }, [pools, search, text])

  return poolSearched
}

export const useFilterPools = (key = FilterPools.AllPools) => {
  const pools = usePools()
  const [poolsFilter, setPoolsFilter] = useState<typeof pools>({})
  const accounts = useAllTokenAccounts()
  const { publicKey } = useWallet()

  const checkIsYourPool = useCallback(
    (address: string) =>
      !!publicKey && pools[address].authority.equals(publicKey),
    [pools, publicKey],
  )

  const checkIsDepositedPool = useCallback(
    async (poolAddress: string) => {
      if (!publicKey) return false
      const tokenAccountLptAddr = await utils.token
        .associatedAddress({
          mint: pools[poolAddress].mintLpt,
          owner: publicKey,
        })
        .toBase58()
      return !!accounts[tokenAccountLptAddr]?.amount.toNumber()
    },
    [accounts, pools, publicKey],
  )

  const filterListPools = useCallback(async () => {
    const newPools: typeof pools = {}
    for (const poolAddress in pools) {
      let isValid = false
      switch (key) {
        case FilterPools.YourPools:
          isValid = checkIsYourPool(poolAddress)
          break
        case FilterPools.DepositedPools:
          isValid = await checkIsDepositedPool(poolAddress)
          break
        default:
          isValid = true
          break
      }

      for (const reserve of pools[poolAddress].reserves) {
        if (reserve.isZero()) isValid = false
      }

      if (isValid) newPools[poolAddress] = pools[poolAddress]
    }
    setPoolsFilter(newPools)
  }, [checkIsDepositedPool, checkIsYourPool, key, pools])

  useEffect(() => {
    filterListPools()
  }, [filterListPools])

  return poolsFilter
}

export const useVolume24h = (poolAddress: string) => {
  const [chartData, setChartData] = useState<VolumeData[]>([])
  const dailyInfo = useStatByPoolAddress(poolAddress)

  const buildChartData = useCallback(async () => {
    if (!poolAddress || !dailyInfo) return setChartData([])
    const chartData = Object.keys(dailyInfo).map((time) => {
      return {
        data: dailyInfo[time].volume,
        label: dayjs(time, 'YYYYMMDD').format('MM/DD'),
      }
    })
    return setChartData(chartData)
  }, [dailyInfo, poolAddress])
  useEffect(() => {
    buildChartData()
  }, [buildChartData])

  const vol24h = useMemo(() => {
    const today = chartData[chartData.length - 1]?.data || 0
    const yesterday = chartData[chartData.length - 2]?.data || 0
    const house = new Date().getHours()
    return today + (house * yesterday) / 24
  }, [chartData])

  return { chartData, vol24h }
}

export const useOracles = () => {
  const calcNormalizedWeight = useCallback((weights: BN[], weightToken: BN) => {
    const numWeightsIn = weights.map((value) =>
      Number(undecimalize(value, GENERAL_DECIMALS)),
    )
    const numWeightToken = Number(undecimalize(weightToken, GENERAL_DECIMALS))
    const weightSum = numWeightsIn.reduce((pre, curr) => pre + curr, 0)
    return numWeightToken / weightSum
  }, [])

  const getMintInfo = useCallback(
    (poolData: PoolData, inputMint: PublicKey) => {
      const mintIdx = poolData.mints.findIndex((mint) => mint.equals(inputMint))

      if (mintIdx === -1) throw new Error('Can not find mint in pool')

      const normalizedWeight = calcNormalizedWeight(
        poolData.weights,
        poolData.weights[mintIdx],
      )
      return {
        reserve: poolData.reserves[mintIdx],
        normalizedWeight: normalizedWeight,
        treasury: poolData.treasuries[mintIdx],
      }
    },
    [calcNormalizedWeight],
  )

  return { calcNormalizedWeight, getMintInfo }
}
