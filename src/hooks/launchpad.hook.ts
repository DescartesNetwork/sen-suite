import { useCallback, useEffect, useMemo, useState } from 'react'
import { encode, decode } from 'bs58'
import { utilsBN } from '@sen-use/web3'
import { MintActionStates, MintConfigs } from '@senswap/balancer'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import Launchpad from '@sentre/launchpad'
import axios from 'axios'
import useSWR from 'swr'
import BN from 'bn.js'

import { useAnchorProvider } from '@/providers/wallet.provider'
import {
  useCheques,
  useFilterCheques,
  useLaunchpadByAddress,
  useLaunchpads,
} from '@/providers/launchpad.provider'
import { LaunchpadMetadata, toFilename, uploadFileToAws } from '@/helpers/aws'
import solConfig from '@/configs/sol.config'
import { usePrices } from '@/providers/mint.provider'
import { usePoolByAddress } from '@/providers/pools.provider'
import { decimalize } from '@/helpers/decimals'
import { useMints } from './spl.hook'
import { GENERAL_NORMALIZED_NUMBER, useBalancer } from './pool.hook'

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
  baseAmount: string
}

export type LaunchpadInfo = {
  projectInfo: ProjectInfo
  mint: string
  stableMint: string
  amount: string
  fee: string
  startPrice: string
  endPrice: string
  startTime: number
  endTime: number
}

export enum LaunchpadSate {
  active = 'active',
  upcoming = 'upcoming',
  completed = 'completed',
  yourPurchase = 'Your purchased',
}
const DEFAULT_TAX_FEE = new BN(500_000) // 0.05%

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
        console.log('cid', cid)
        const fileName = toFilename(cid)
        const url = 'https://sen-storage.s3.us-west-2.amazonaws.com/' + fileName
        console.log('url ', url)
        const { data } = await axios.get(url)
        return data as ProjectInfo
      } catch (error) {
        console.log(error)
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
  const [stbPrice] = usePrices([stableMint.toBase58()]) || [0]
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
      startWeights = [new BN(0), new BN(0)],
      endWeights = [new BN(0), new BN(0)],
      startTime = 0,
      endTime = 0,
    ) => {
      const MINT_IDX = 0
      const BASE_MINT_IDX = 1
      const launchpadData = launchpads[launchpadAddr] || {
        startWeights: [new BN(0), new BN(0)],
        endWeights: [new BN(0), new BN(0)],
        startTime: new BN(0),
        endTime: new BN(0),
      }
      const start_time = launchpadAddr
        ? launchpadData.startTime.toNumber()
        : startTime
      const end_time = launchpadAddr
        ? launchpadData.endTime.toNumber()
        : endTime

      const start_weight_mint = launchpadAddr
        ? launchpadData.startWeights[MINT_IDX].toNumber()
        : startWeights[MINT_IDX].toNumber()

      const start_weight_base_mint = launchpadAddr
        ? launchpadData.startWeights[BASE_MINT_IDX].toNumber()
        : startWeights[BASE_MINT_IDX].toNumber()

      const end_weight_mint = launchpadAddr
        ? launchpadData.endWeights[MINT_IDX].toNumber()
        : endWeights[MINT_IDX].toNumber()

      const end_weight_base_mint = launchpadAddr
        ? launchpadData.endWeights[BASE_MINT_IDX].toNumber()
        : endWeights[BASE_MINT_IDX].toNumber()

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

/**
 * Calculate amount swap out
 * @returns amount out
 */
export const useCalcInGivenOutSwap = () => {
  const calcInGivenOutSwap = useCallback(
    (
      amountIn: BN,
      balanceOut: BN,
      balanceIn: BN,
      weightOut: number,
      weightIn: number,
      swapFee: BN,
    ) => {
      const numBalanceOut = utilsBN.toNumber(balanceOut)
      const numBalanceIn = utilsBN.toNumber(balanceIn)
      const numAmountIn = utilsBN.toNumber(amountIn)
      const numSwapFee = utilsBN.toNumber(swapFee) / GENERAL_NORMALIZED_NUMBER
      const ratioBeforeAfterBalance =
        numBalanceIn / (numBalanceIn + numAmountIn)

      const ratioInOutWeight = weightIn / weightOut
      return new BN(
        numBalanceOut *
          (1 - ratioBeforeAfterBalance ** ratioInOutWeight) *
          (1 - numSwapFee),
      )
    },
    [],
  )
  return calcInGivenOutSwap
}

/**
 * Calculate weight in Pool
 * @returns  Calc function
 */
export const useCalcWeight = () => {
  const calcWeight = useCallback(
    (priceA: number, balanceA: number, priceB: number, balanceB: number) => {
      const total = priceA * balanceA + priceB * balanceB
      const weightA = (priceA * balanceA) / total
      const weightB = 1 - weightA
      return {
        weightA: utilsBN.decimalize(weightA, 9),
        weightB: utilsBN.decimalize(weightB, 9),
      }
    },
    [],
  )
  return calcWeight
}

/**
 * Calculate avg price
 * @returns  avg price
 */
export const useAVGPrice = (launchpadAddress: string) => {
  const cheques = useCheques()
  const filteredCheques = useFilterCheques(launchpadAddress)

  const avgPrice = useMemo(() => {
    if (!filteredCheques.length) return 0
    let totalPrice = 0

    for (const chequeAddress of filteredCheques) {
      const { askAmount, bidAmount } = cheques[chequeAddress]
      let price = 0
      if (askAmount.toNumber())
        price = bidAmount.toNumber() / askAmount.toNumber()
      totalPrice += price
    }
    return totalPrice / filteredCheques.length
  }, [cheques, filteredCheques])

  return avgPrice
}

/**
 * Buy token
 * @param amount amount token
 * @param launchpadAddress launchpad address
 * @returns transaction id
 */
export const useBuyToken = (amount: string, launchpadAddress: string) => {
  const { mint } = useLaunchpadByAddress(launchpadAddress)
  const [mintInfo] = useMints([mint.toBase58()])
  const decimals = mintInfo?.decimals || 0
  const launchpadProgram = useLaunchpadProgram()
  const provider = useAnchorProvider()

  const onBuyToken = useCallback(async () => {
    const cheque = Keypair.generate()
    const tx = new Transaction()
    const bnAmount = decimalize(amount, decimals)

    const { tx: txPrint } = await launchpadProgram.printBaseMint({
      launchpad: new PublicKey(launchpadAddress),
      amount: bnAmount,
      sendAndConfirm: false,
      cheque,
    })
    tx.add(txPrint)
    const { tx: txBuy } = await launchpadProgram.buyLaunchpad({
      launchpad: new PublicKey(launchpadAddress),
      bidAmount: bnAmount,
      cheque: cheque.publicKey,
      sendAndConfirm: false,
    })
    tx.add(txBuy)

    const txId = await provider.sendAndConfirm(tx, [cheque])

    return txId
  }, [amount, decimals, launchpadAddress, launchpadProgram, provider])

  return onBuyToken
}

/**
 * Claim token when the campaign ended
 * @param launchpadAddress launchpad address
 * @returns transaction id
 */
export const useClaim = (launchpadAddress: string) => {
  const launchpadProgram = useLaunchpadProgram()

  const onClaim = useCallback(async () => {
    const { txId } = await launchpadProgram.claim({
      launchpad: new PublicKey(launchpadAddress),
    })
    return txId
  }, [launchpadAddress, launchpadProgram])
  return onClaim
}

export const useInitLaunchpad = (props: LaunchpadInfo) => {
  const mints = useMints([props.mint, props.stableMint])
  const [baseDecimal, stableDecimal] = mints.map((mint) => mint?.decimals || 0)
  const provider = useAnchorProvider()
  const launchpadProgram = useLaunchpadProgram()
  const [stablePrice] = usePrices([props.stableMint]) || [1]
  const calcWeight = useCalcWeight()
  const balancer = useBalancer()

  const onCreate = useCallback(async () => {
    const { amount, mint, endTime, endPrice, fee } = props
    const { stableMint, projectInfo, startPrice, startTime } = props
    const { baseAmount } = projectInfo
    projectInfo.socials = projectInfo.socials.filter((url) => !!url)
    projectInfo.vCs = projectInfo.vCs.filter((url) => !!url)
    const launchpad = Keypair.generate()
    const transaction = new Transaction()

    const bnAmount = decimalize(amount, baseDecimal)
    const bnBaseAmount = decimalize(baseAmount, stableDecimal)
    const blob = [
      new Blob([JSON.stringify(projectInfo, null, 2)], {
        type: 'application/json',
      }),
    ]
    const file = new File(blob, 'metadata.txt')
    const cid = await uploadFileToAws(file)
    const swapFee = decimalize(fee, 9)

    /** Initialize launchpad */
    await launchpadProgram.initializeLaunchpad({
      baseAmount: bnBaseAmount,
      stableMint: new PublicKey(stableMint),
      mint: new PublicKey(mint),
      sendAndConfirm: true,
      launchpad,
    })

    const baseMint = await launchpadProgram.deriveBaseMintAddress(
      launchpad.publicKey,
    )
    const startWeights = calcWeight(
      Number(startPrice),
      Number(amount),
      stablePrice || 1,
      Number(baseAmount),
    )
    const endWeights = calcWeight(
      Number(endPrice),
      Number(amount),
      stablePrice || 1,
      Number(baseAmount),
    )

    const mintsConfigs: MintConfigs[] = [
      {
        publicKey: mint,
        action: MintActionStates.Active,
        amountIn: bnAmount,
        weight: startWeights.weightA,
      },
      {
        publicKey: baseMint,
        action: MintActionStates.Active,
        amountIn: bnBaseAmount,
        weight: startWeights.weightB,
      },
    ]
    /** Initialize Pool  */
    const { poolAddress } = await balancer.initializePool({
      fee: swapFee,
      taxFee: DEFAULT_TAX_FEE,
      mintsConfigs,
      taxMan: solConfig.taxman,
    })

    /** Join to Pool  */
    const { transaction: txMintJoin } = await balancer.initializeJoin({
      poolAddress,
      mint,
      amountIn: bnAmount,
      sendAndConfirm: false,
    })

    const { transaction: txBaseMintJoin } = await balancer.initializeJoin({
      poolAddress,
      mint: baseMint,
      amountIn: bnBaseAmount,
      sendAndConfirm: false,
    })

    transaction.add(txMintJoin)
    transaction.add(txBaseMintJoin)

    /** Update action */
    const { tx: txUpdateAction } = await balancer.updateActions({
      poolAddress,
      actions: [MintActionStates.AskOnly, MintActionStates.BidOnly],
      sendAndConfirm: false,
    })
    transaction.add(txUpdateAction)

    /** Transfer pool Owner */
    const treasurer = await launchpadProgram.deriveTreasurerAddress(
      launchpad.publicKey,
    )
    const { tx: txTransfer } = await balancer.transferOwnership({
      poolAddress,
      newOwner: treasurer,
      sendAndConfirm: false,
    })
    transaction.add(txTransfer)
    /** Active launchpad */
    const { tx: txActive } = await launchpadProgram.activeLaunchpad({
      pool: new PublicKey(poolAddress),
      startTime: new BN(startTime / 1000),
      endTime: new BN(endTime / 1000),
      launchpad: launchpad.publicKey,
      metadata: Array.from(decode(cid)),
      endWeights: [endWeights.weightA, endWeights.weightB],
      sendAndConfirm: false,
    })
    transaction.add(txActive)

    return await provider.sendAndConfirm(transaction)
  }, [
    balancer,
    baseDecimal,
    calcWeight,
    launchpadProgram,
    props,
    provider,
    stableDecimal,
    stablePrice,
  ])

  return onCreate
}
