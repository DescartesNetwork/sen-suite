import { useCallback, useMemo, useState } from 'react'
import SenFarmingProgram from '@sentre/farming'
import BN from 'bn.js'
import { useInterval } from 'react-use'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { ComputeBudgetProgram, PublicKey, Transaction } from '@solana/web3.js'

import { useAnchorProvider } from '@/hooks/spl.hook'
import solConfig from '@/configs/sol.config'
import {
  useAllFarms,
  useDebtByFarmAddress,
  useFarmByAddress,
} from '@/providers/farming.provider'
import { isAddress } from '@/helpers/utils'
import { useMpl } from './mpl.hook'

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

/**
 * Get farm's harvest function
 * @param farmAddress Farm address
 * @returns Harvest function
 */
export const useHarvest = (farmAddress: string) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { connection } = useConnection()
  const farming = useFarming()

  const harvest = useCallback(async () => {
    if (!publicKey || !signTransaction || !sendTransaction)
      throw new Error('Wallet is not connected yet.')
    if (!isAddress(farmAddress)) throw new Error('Invalid farm address.')
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext()
    const tx = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: publicKey,
    })
    const txs = await Promise.all([
      farming.unstake({ farm: farmAddress, sendAndConfirm: false }),
      farming.stake({ farm: farmAddress, sendAndConfirm: false }),
      farming.claim({ farm: farmAddress, sendAndConfirm: false }),
      farming.convertRewards({ farm: farmAddress, sendAndConfirm: false }),
    ])
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
      ...txs.map(({ tx }) => tx),
    )
    const signature = await sendTransaction(tx, connection, {
      minContextSlot,
    })
    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    })
    return signature
  }, [
    farmAddress,
    publicKey,
    signTransaction,
    sendTransaction,
    connection,
    farming,
  ])

  return harvest
}

/**
 * Get farm's stake function
 * @param farmAddress Farm address
 * @param amount Stake amount
 * @returns Stake function
 */
export const useStake = (
  farmAddress: string,
  amount: BN,
  nfts: string[] = [],
) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { connection } = useConnection()
  const farming = useFarming()
  const { shares } = useDebtByFarmAddress(farmAddress) || {}
  const mpl = useMpl()

  const stake = useCallback(async () => {
    if (!publicKey || !signTransaction || !sendTransaction)
      throw new Error('Wallet is not connected yet.')
    if (!isAddress(farmAddress)) throw new Error('Invalid farm address.')
    if (amount.isZero()) throw new Error('Invalid amount.')
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext()
    const tx = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: publicKey,
    })
    const txs = await Promise.all([
      ...(!shares
        ? [farming.initializeDebt({ farm: farmAddress, sendAndConfirm: false })]
        : [
            farming.unstake({ farm: farmAddress, sendAndConfirm: false }),
            farming.withdraw({
              farm: farmAddress,
              shares,
              sendAndConfirm: false,
            }),
          ]),
      ...nfts.map(async (nft) => {
        const { metadataAddress, collection } = await mpl
          .nfts()
          .findByMint({ mintAddress: new PublicKey(nft) })
        return farming.lock({
          farm: farmAddress,
          nft,
          metadata: metadataAddress,
          collection: collection?.address || '',
          sendAndConfirm: false,
        })
      }),
      farming.deposit({
        farm: farmAddress,
        inAmount: amount.add(shares || new BN(0)),
        sendAndConfirm: false,
      }),
      farming.stake({ farm: farmAddress, sendAndConfirm: false }),
    ])
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
      ...txs.map(({ tx }) => tx),
    )
    const signature = await sendTransaction(tx, connection, {
      minContextSlot,
    })
    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    })
    return signature
  }, [
    farmAddress,
    amount,
    nfts,
    shares,
    publicKey,
    signTransaction,
    sendTransaction,
    connection,
    farming,
    mpl,
  ])

  return stake
}

/**
 * Get farm's unstake function
 * @param farmAddress Farm address
 * @param amount Unstake amount
 * @returns Unstake function
 */
export const useUnstake = (farmAddress: string, shares: BN) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { connection } = useConnection()
  const farming = useFarming()

  const unstake = useCallback(async () => {
    if (!publicKey || !signTransaction || !sendTransaction)
      throw new Error('Wallet is not connected yet.')
    if (!isAddress(farmAddress)) throw new Error('Invalid farm address.')
    if (shares.isZero()) throw new Error('Invalid amount.')
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext()
    const tx = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: publicKey,
    })
    const txs = await Promise.all([
      farming.unstake({ farm: farmAddress, sendAndConfirm: false }),
      farming.withdraw({ farm: farmAddress, shares, sendAndConfirm: false }),
      farming.stake({ farm: farmAddress, sendAndConfirm: false }),
    ])
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
      ...txs.map(({ tx }) => tx),
    )
    const signature = await sendTransaction(tx, connection, {
      minContextSlot,
    })
    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    })
    return signature
  }, [
    farmAddress,
    shares,
    publicKey,
    signTransaction,
    sendTransaction,
    connection,
    farming,
  ])

  return unstake
}

/**
 * Get farm's transfer ownership function
 * @param farmAddress Farm address
 * @returns Transfer ownership function
 */
export const useTransferOwnership = (
  farmAddress: string,
  ownerAddress: string,
) => {
  const farming = useFarming()

  const transferOwnership = useCallback(async () => {
    if (!isAddress(farmAddress)) throw new Error('Invalid farm address.')
    if (!isAddress(ownerAddress)) throw new Error('Invalid owner address.')
    const { txId } = await farming.transferOwnership({
      farm: farmAddress,
      newOwner: ownerAddress,
    })
    return txId
  }, [farmAddress, ownerAddress, farming])

  return transferOwnership
}
