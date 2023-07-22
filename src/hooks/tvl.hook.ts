import BN from 'bn.js'
import { useMemo } from 'react'

import { useAllMints, usePrices } from '@/providers/mint.provider'
import { undecimalize } from '@/helpers/decimals'

export const useTvl = (mintAddressToAmount: Array<[string, BN]>) => {
  const mints = useAllMints()
  const mintAddresses = useMemo(
    () => mintAddressToAmount.map(([mintAddress]) => mintAddress),
    [mintAddressToAmount],
  )
  const amounts = useMemo(
    () => mintAddressToAmount.map(([_, amount]) => amount),
    [mintAddressToAmount],
  )
  const prices = usePrices(mintAddresses)
  const decimals = useMemo(
    () =>
      mintAddresses.map(
        (mintAddress) =>
          mints.find(({ address }) => address === mintAddress)?.decimals || 0,
      ),
    [mintAddresses, mints],
  )

  const tvl = useMemo(() => {
    if (!prices) return 0
    return amounts.reduce((a, b, i) => {
      return a + Number(undecimalize(b, decimals[i])) * prices[i]
    }, 0)
  }, [amounts, prices, decimals])

  return tvl
}
