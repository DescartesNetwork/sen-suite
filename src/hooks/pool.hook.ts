import { useCallback, useEffect, useMemo, useState } from 'react'
import Balancer, {
  MintActionState,
  MintActionStates,
  PoolData,
} from '@senswap/balancer'
import { useWallet } from '@solana/wallet-adapter-react'
import { utils } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { WRAPPED_SOL_MINT } from '@metaplex-foundation/js'
import { initTxCreateMultiTokenAccount } from '@sen-use/web3'
import BN from 'bn.js'
import axios from 'axios'
import useSWR from 'swr'

import { useAnchorProvider } from '@/providers/wallet.provider'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { useSearchMint } from '@/providers/mint.provider'
import { usePoolByAddress, usePools } from '@/providers/pools.provider'
import { useAllTokenAccounts } from '@/providers/tokenAccount.provider'
import { useInitPDAAccount, useMints, useSpl } from './spl.hook'
import solConfig from '@/configs/sol.config'
import { DateHelper } from '@/helpers/date'
import { useTvl } from './tvl.hook'

export const GENERAL_NORMALIZED_NUMBER = 10 ** 9
export const LPT_DECIMALS = 9
export const GENERAL_DECIMALS = 9
export const PRECISION = 1_000_000_000
const DEFAULT_SWAP_FEE = new BN(2_500_000) // 0.25%
const DEFAULT_TAX_FEE = new BN(500_000) // 0.05%

export enum FilterPools {
  AllPools = 'all-pools',
  DepositedPools = 'deposited-pools',
  YourPools = 'your-pools',
}

export enum StatePool {
  Frozen = 'frozen',
  Initialized = 'initialized',
  Active = 'active',
}
export type VolumeData = { data: number; label: string }

export type PoolPairLpData = {
  balanceIn: BN
  balanceOut: BN
  weightIn: number
  decimalIn: number
  swapFee: BN
}

export type MintSetup = {
  mintAddress: string
  weight: string
  isLocked: boolean
}

/**
 * Instantiate a balancer
 * @returns Balancer instance
 */
export const useBalancer = () => {
  const provider = useAnchorProvider()
  const balancer = useMemo(
    () => new Balancer(provider, solConfig.balancerAddress),
    [provider],
  )
  return balancer
}

/**
 * Get searched Pools
 * @param pools List pools wanna search
 * @param text search text
 * @returns Searched Pools
 */
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

/**
 * Get filtered Pools
 * @param key filter key
 * @returns Filtered Pools
 */
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

/**
 * Wrap and Unwrap sol
 * @returns Wrap and Unwrap sol functions
 */
export const useWrapSol = () => {
  const spl = useSpl()
  const accounts = useAllTokenAccounts()
  const onInitAccount = useInitPDAAccount()
  const { publicKey } = useWallet()

  const createTxUnwrapSol = useCallback(
    async (owner: PublicKey) => {
      const ata = utils.token.associatedAddress({
        mint: WRAPPED_SOL_MINT,
        owner,
      })
      const tx = await spl.methods
        .closeAccount()
        .accounts({
          account: ata,
          destination: owner,
          owner: owner,
        })
        .transaction()
      return tx
    },
    [spl.methods],
  )

  const createWrapSol = useCallback(
    async (amount: BN) => {
      if (!publicKey) return
      const tx = new Transaction()
      const ataSol = utils.token.associatedAddress({
        mint: WRAPPED_SOL_MINT,
        owner: publicKey,
      })
      if (!accounts[ataSol.toBase58()]) {
        const txInitAcc = await onInitAccount(WRAPPED_SOL_MINT, publicKey)
        if (txInitAcc) tx.add(txInitAcc)
      }
      const txSolTransfer = await SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: ataSol,
        lamports: BigInt(amount.toString()),
      })
      const txSync = await spl.methods
        .syncNative()
        .accounts({ account: ataSol })
        .instruction()
      tx.add(txSolTransfer, txSync)

      return tx
    },
    [accounts, onInitAccount, publicKey, spl.methods],
  )

  return { createTxUnwrapSol, createWrapSol }
}

/**
 * Deposit token into pool
 * @param poolAddress Pool address
 * @param amountIns list amount in
 * @returns Deposit function
 */
export const useDeposit = (poolAddress: string, amountIns: string[]) => {
  const balancer = useBalancer()
  const { publicKey } = useWallet()
  const accounts = useAllTokenAccounts()
  const pool = usePoolByAddress(poolAddress)
  const mints = useMints(pool.mints.map((mint) => mint.toBase58()))
  const decimals = mints.map((mint) => mint?.decimals || 0)
  const provider = useAnchorProvider()
  const { createWrapSol } = useWrapSol()

  const onDeposit = useCallback(async () => {
    if (!publicKey) return
    const transaction = new Transaction()
    const dAmountIns = amountIns.map((amount, i) =>
      decimalize(amount, decimals[i]),
    )

    for (const i in pool.mints) {
      const mint = pool.mints[i]
      const ataAddress = utils.token.associatedAddress({
        mint,
        owner: publicKey,
      })
      const { amount } = accounts[ataAddress.toBase58()] || {
        amount: new BN(0),
      }
      // Wrap sol token if needed
      if (mint.equals(WRAPPED_SOL_MINT) && dAmountIns[i].gt(amount)) {
        const txWrapSol = await createWrapSol(dAmountIns[i].sub(amount))
        if (txWrapSol) transaction.add(txWrapSol)
      }
    }
    const { tx: txDeposit } = await balancer.addLiquidity(
      poolAddress,
      dAmountIns,
      false,
    )
    transaction.add(txDeposit)
    const txId = await provider.sendAndConfirm(transaction)
    return txId
  }, [
    accounts,
    amountIns,
    balancer,
    createWrapSol,
    decimals,
    pool.mints,
    poolAddress,
    provider,
    publicKey,
  ])

  return onDeposit
}

/**
 * Withdraw token one side or full side
 * @param poolAddress Pool address
 * @param amount amount take out pool
 * @param mintAddress (Optional) mint address for withdraw one side
 * @returns Deposit function
 */
export const useWithdraw = (
  poolAddress: string,
  amount: string,
  mintAddress = '',
) => {
  const provider = useAnchorProvider()
  const balancer = useBalancer()
  const { publicKey } = useWallet()
  const { mints } = usePoolByAddress(poolAddress)
  const { createTxUnwrapSol } = useWrapSol()

  const onWithdrawSide = useCallback(async () => {
    if (!publicKey || !mintAddress) return ''
    const dAmount = decimalize(amount, LPT_DECIMALS)
    const transaction = new Transaction()

    const { tx: txWithdraw } = await balancer.removeSidedLiquidity(
      poolAddress,
      mintAddress,
      dAmount,
      false,
    )
    transaction.add(txWithdraw)
    if (mintAddress === WRAPPED_SOL_MINT.toBase58()) {
      const txUnwrapSol = await createTxUnwrapSol(publicKey)
      transaction.add(txUnwrapSol)
    }
    return await provider.sendAndConfirm(transaction)
  }, [
    amount,
    balancer,
    createTxUnwrapSol,
    mintAddress,
    poolAddress,
    provider,
    publicKey,
  ])

  const onWithdraw = useCallback(async () => {
    if (!publicKey) return ''
    if (mintAddress) return await onWithdrawSide()
    const dAmount = decimalize(amount, LPT_DECIMALS)

    const transactions = await initTxCreateMultiTokenAccount(provider, {
      mints,
    })

    const { transaction } = await balancer.createRemoveLiquidityTransaction(
      poolAddress,
      dAmount,
    )
    transactions.push(transaction)

    for (const mint of mints) {
      if (WRAPPED_SOL_MINT.equals(mint)) {
        const unwrapSolTx = await createTxUnwrapSol(publicKey)
        transactions.push(unwrapSolTx)
      }
    }
    const txIds = await provider.sendAll(
      transactions.map((tx) => {
        return { tx, signers: [] }
      }),
    )
    return txIds.pop() || ''
  }, [
    amount,
    balancer,
    createTxUnwrapSol,
    mintAddress,
    mints,
    onWithdrawSide,
    poolAddress,
    provider,
    publicKey,
  ])

  return onWithdraw
}

/**
 * Init and delete pool
 * @returns Init and delete pool functions
 */
export const useInitAndDeletePool = () => {
  const balancer = useBalancer()

  const initPool = useCallback(
    async (mints: MintSetup[]) => {
      const mintsConfigs = mints.map(({ mintAddress, weight }) => {
        const dWeight = decimalize(weight, GENERAL_DECIMALS)
        return {
          publicKey: new PublicKey(mintAddress),
          action: MintActionStates.Active,
          amountIn: new BN(0),
          weight: dWeight,
        }
      })
      const { txId, poolAddress } = await balancer.initializePool({
        fee: DEFAULT_SWAP_FEE,
        taxFee: DEFAULT_TAX_FEE,
        mintsConfigs,
        taxMan: solConfig.taxman,
        sendAndConfirm: true,
      })
      return { txId, poolAddress }
    },
    [balancer],
  )

  const deletePool = useCallback(
    async (poolAddress: string) => {
      const { txId } = await balancer.closePool(poolAddress)
      return txId
    },
    [balancer],
  )

  return { initPool, deletePool }
}

/**
 * Add liquidity when create new pool
 * @param poolAddress Pool address
 * @param amountIns List amount in
 * @returns Add liquidity function
 */
export const useAddLiquidity = (poolAddress: string, amountIns: string[]) => {
  const balancer = useBalancer()
  const { publicKey } = useWallet()
  const accounts = useAllTokenAccounts()
  const pool = usePoolByAddress(poolAddress)
  const mints = useMints(pool.mints.map((mint) => mint.toBase58()))
  const decimals = mints.map((mint) => mint?.decimals || 0)
  const provider = useAnchorProvider()
  const { createWrapSol } = useWrapSol()

  const onAddLiquidity = useCallback(async () => {
    if (!publicKey) return
    const transaction = new Transaction()
    const dAmountIns = amountIns.map((amount, i) =>
      decimalize(amount, decimals[i]),
    )

    for (const i in pool.mints) {
      const mint = pool.mints[i]
      if (!pool.reserves[i].isZero()) continue
      const ataAddress = utils.token.associatedAddress({
        mint,
        owner: publicKey,
      })
      const { amount } = accounts[ataAddress.toBase58()] || {
        amount: new BN(0),
      }
      // Wrap sol token if needed
      if (mint.equals(WRAPPED_SOL_MINT) && dAmountIns[i].gt(amount)) {
        const txWrapSol = await createWrapSol(dAmountIns[i].sub(amount))
        if (txWrapSol) transaction.add(txWrapSol)
      }
      const { transaction: txAddLiquidity } = await balancer.initializeJoin({
        amountIn: dAmountIns[i],
        mint,
        poolAddress,
        sendAndConfirm: false,
      })
      transaction.add(txAddLiquidity)
    }

    const txId = await provider.sendAndConfirm(transaction)
    return txId
  }, [
    accounts,
    amountIns,
    balancer,
    createWrapSol,
    decimals,
    pool,
    poolAddress,
    provider,
    publicKey,
  ])

  return onAddLiquidity
}

/**
 * Oracles functions
 * @returns Oracles functions
 */
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

  const calcLptOut = useCallback(
    (
      tokenAmountIns: BN[],
      balanceIns: BN[],
      weightIns: BN[],
      totalSupply: BN,
      decimalIns: number[],
      swapFee: BN,
    ) => {
      const fee = Number(undecimalize(swapFee, GENERAL_DECIMALS))
      const numTotalSupply = Number(undecimalize(totalSupply, LPT_DECIMALS))
      const numBalanceIns = balanceIns.map((value, idx) =>
        Number(undecimalize(value, decimalIns[idx])),
      )
      const numAmountIns = tokenAmountIns.map((value, idx) =>
        Number(undecimalize(value, decimalIns[idx])),
      )
      const balanceRatiosWithFee = new Array(tokenAmountIns.length)

      let invariantRatioWithFees = 0
      for (let i = 0; i < tokenAmountIns.length; i++) {
        const nomalizedWeight = calcNormalizedWeight(weightIns, weightIns[i])

        balanceRatiosWithFee[i] =
          (numBalanceIns[i] + numAmountIns[i]) / numBalanceIns[i]

        invariantRatioWithFees += balanceRatiosWithFee[i] * nomalizedWeight
      }

      let invariantRatio = 1

      for (let i = 0; i < tokenAmountIns.length; i++) {
        const nomalizedWeight = calcNormalizedWeight(weightIns, weightIns[i])
        let amountInWithoutFee = numAmountIns[i]
        if (balanceRatiosWithFee[i] > invariantRatioWithFees) {
          const nonTaxableAmount =
            numBalanceIns[i] * (invariantRatioWithFees - 1)
          const taxableAmount = numAmountIns[i] - nonTaxableAmount
          amountInWithoutFee = nonTaxableAmount + taxableAmount * (1 - fee)
        }
        const balanceRatio =
          (numBalanceIns[i] + amountInWithoutFee) / numBalanceIns[i]
        invariantRatio = invariantRatio * balanceRatio ** nomalizedWeight
      }
      if (invariantRatio > 1) return numTotalSupply * (invariantRatio - 1)
      return 0
    },
    [calcNormalizedWeight],
  )

  const spotPriceAfterSwapTokenInForExactLPTOut = useCallback(
    (poolPairData: PoolPairLpData) => {
      const { balanceOut, balanceIn, swapFee, decimalIn } = poolPairData
      const Bo = Number(undecimalize(balanceOut, LPT_DECIMALS))
      const Ao = Number(undecimalize(new BN(0), LPT_DECIMALS))
      const wi = poolPairData.weightIn
      const Bi = Number(undecimalize(balanceIn, decimalIn))
      const f = Number(undecimalize(swapFee, GENERAL_DECIMALS))

      return (
        (Math.pow((Ao + Bo) / Bo, 1 / wi) * Bi) /
        ((Ao + Bo) * (1 + f * (-1 + wi)) * wi)
      )
    },
    [],
  )

  const calcLpForTokensZeroPriceImpact = useCallback(
    (
      tokenAmountIns: BN[],
      balanceIns: BN[],
      weightIns: BN[],
      totalSupply: BN,
      decimalIns: number[],
    ) => {
      const numTokenAmountIns = tokenAmountIns.map((value, idx) =>
        Number(undecimalize(value, decimalIns[idx])),
      )
      const amountLpOut = numTokenAmountIns.reduce(
        (totalBptOut, amountIn, i) => {
          const normalizedWeight = calcNormalizedWeight(weightIns, weightIns[i])
          const poolPairData: PoolPairLpData = {
            balanceIn: balanceIns[i],
            balanceOut: totalSupply,
            weightIn: normalizedWeight,
            decimalIn: decimalIns[i],
            swapFee: new BN(0),
          }
          const LpPrice = spotPriceAfterSwapTokenInForExactLPTOut(poolPairData)
          const LpOut = amountIn / LpPrice
          return totalBptOut + LpOut
        },
        0,
      )

      return amountLpOut
    },
    [calcNormalizedWeight, spotPriceAfterSwapTokenInForExactLPTOut],
  )

  return {
    calcNormalizedWeight,
    getMintInfo,
    calcLptOut,
    calcLpForTokensZeroPriceImpact,
  }
}

/**
 * Calculate volumes in 7 days of pool
 * @param poolAddress Pool address
 * @returns Total vol in 7 days, vol24h
 */
export const useVol24h = (poolAddress: string) => {
  const { treasuries } = usePoolByAddress(poolAddress)

  const fetcher = useCallback(async () => {
    const dateRange = 7
    const ymdTo = new DateHelper().ymd()
    const ymdFrom = new DateHelper().subtractDay(dateRange).ymd()
    const tokenAccounts = treasuries.map((treasury) => treasury.toBase58())
    const programId = solConfig.balancerAddress
    const { data } = await axios.get(solConfig.statRpc + 'volume', {
      params: { ymdTo, ymdFrom, tokenAccounts, programId },
    })
    return data || { totalVol: 0, volumes: {} }
  }, [treasuries])

  const { data: vols, isLoading } = useSWR([poolAddress, 'vol24h'], fetcher)

  const vol24h = useMemo(() => {
    if (!vols) return 0
    const { volumes } = vols
    const today = volumes[new DateHelper().ymd()]
    const yesterday = volumes[new DateHelper().subtractDay(1).ymd()]
    const hour = new Date().getHours()
    return today + (hour * yesterday) / 24
  }, [vols])

  return { vols, isLoading, vol24h }
}

/**
 * Calculate apy pool
 * @param poolAddress Pool address
 * @returns apy
 */
export const useApy = (poolAddress: string) => {
  const { reserves, mints, taxFee, fee } = usePoolByAddress(poolAddress)
  const { vols } = useVol24h(poolAddress)
  const poolReserves = useMemo(
    () =>
      reserves.map((reserve, i) => ({
        mintAddress: mints[i].toBase58(),
        amount: reserve,
      })),
    [reserves, mints],
  )
  const tvl = useTvl(poolReserves)

  const apy = useMemo(() => {
    if (!vols || !tvl) return 0
    const dateRange = 7

    const { totalVol } = vols
    const totalFee =
      Number(undecimalize(fee.add(taxFee), GENERAL_DECIMALS)) * totalVol
    const feePerDay = totalFee / dateRange
    const roi = feePerDay / tvl
    const apy = Math.pow(1 + roi, 365) - 1

    return Number.isFinite(apy) ? apy : 0
  }, [fee, taxFee, tvl, vols])

  return apy
}

/**
 * List actions pool management
 * @param poolAddress pool address
 * @returns Actions pool management function
 */
export const usePoolManagement = (poolAddress: string) => {
  const balancer = useBalancer()

  const updateWeights = useCallback(
    async (tokensInfo: Record<string, MintSetup>) => {
      const weights = Object.values(tokensInfo).map(({ weight }) => {
        const newWeight = decimalize(weight, GENERAL_DECIMALS)
        return newWeight
      })
      const { txId } = await balancer.updateWeights({ poolAddress, weights })
      return txId
    },
    [balancer, poolAddress],
  )

  const freezePool = useCallback(async () => {
    const { txId } = await balancer.freezePool({ poolAddress })
    return txId
  }, [balancer, poolAddress])

  const thawPool = useCallback(async () => {
    const { txId } = await balancer.thawPool({ poolAddress })
    return txId
  }, [balancer, poolAddress])

  const updateFreezeAndThawToken = useCallback(
    async (mintActions: MintActionState[]) => {
      const { txId } = await balancer.updateActions({
        poolAddress,
        actions: mintActions,
      })
      return txId
    },
    [balancer, poolAddress],
  )

  const updateFee = useCallback(
    async (fee: string, taxFee: string) => {
      const { txId } = await balancer.updateFee(
        poolAddress,
        new BN((Number(fee) * PRECISION) / 100),
        new BN((Number(taxFee) * PRECISION) / 100),
      )
      return txId
    },
    [balancer, poolAddress],
  )

  const transferOwnership = useCallback(
    async (newOwner: string) => {
      const { txId } = await balancer.transferOwnership({
        poolAddress,
        newOwner,
      })
      return txId
    },
    [balancer, poolAddress],
  )

  return {
    updateWeights,
    freezePool,
    thawPool,
    updateFreezeAndThawToken,
    updateFee,
    transferOwnership,
  }
}
