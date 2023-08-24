import { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { splTokenProgram } from '@coral-xyz/spl-token'

import { isAddress } from '@/helpers/utils'
import { useAnchorProvider } from '@/providers/wallet.provider'

/**
 * Create an SPL instance
 * @returns SPL instance
 */
export const useSpl = () => {
  const provider = useAnchorProvider()
  const spl = useMemo(() => splTokenProgram({ provider }), [provider])
  return spl
}

/**
 * Get mint data
 * @param mintAddresses Mint addresses
 * @returns Mint data
 */
export const useMints = (mintAddresses: string[]) => {
  const spl = useSpl()
  const fetcher = useCallback(
    async ([mintAddresses]: [string[]]) => {
      for (const mintAddress of mintAddresses)
        if (!isAddress(mintAddress)) return undefined
      const data = await spl.account.mint.fetchMultiple(mintAddresses)
      return data
    },
    [spl],
  )
  const { data } = useSWR([mintAddresses, 'spl'], fetcher)
  return data || []
}
