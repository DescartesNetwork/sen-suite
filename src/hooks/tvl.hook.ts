import BN from 'bn.js'
import { useMemo } from 'react'

import { usePrices } from '@/providers/mint.provider'
import { undecimalize } from '@/helpers/decimals'
import { useSplMints } from './spl.hook'

/**
 * Compute TVL for a list of mints
 * @param mintAddressToAmount List of mints and thier corresponding amoubt
 * @returns The TVL
 */
export const useTvl = (
  mintAddressToAmount: Array<{
    mintAddress: string
    amount: BN
  }>,
) => {
  const mintAddresses = useMemo(
    () => mintAddressToAmount.map(({ mintAddress }) => mintAddress),
    [mintAddressToAmount],
  )
  const amounts = useMemo(
    () => mintAddressToAmount.map(({ amount }) => amount),
    [mintAddressToAmount],
  )
  const prices = usePrices(mintAddresses)
  const mints = useSplMints(mintAddresses)
  const decimals = useMemo(() => mints.map((mint) => mint?.decimals), [mints])

  const tvl = useMemo(() => {
    if (!prices) return 0
    return decimals.reduce<number>((s, d, i) => {
      if (d === undefined) return s
      return s + Number(undecimalize(amounts[i], d)) * prices[i]
    }, 0)
  }, [amounts, prices, decimals])

  return tvl
}
